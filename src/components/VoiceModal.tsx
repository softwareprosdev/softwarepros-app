"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resumeAudioContext } from "@/lib/audio-level";
import { VoiceOrb, type OrbState } from "@/components/voice/VoiceOrb";
import { hasRecording, useDictation } from "@/lib/use-dictation";
import { useSpeech } from "@/lib/use-speech";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

/**
 * How long a visitor has to go quiet before the architect takes its turn.
 * Short enough to feel like a conversation, long enough to survive the pause
 * between two sentences of the same thought.
 */
const REPLY_AFTER_SILENCE_MS = 2000;

/**
 * Said at the end of the answer, before the page changes under them. A
 * navigation nobody announced reads as a glitch; announced, it reads as the
 * architect taking them somewhere.
 */
const HANDOFF_LINE =
  "Let's take this into the Discovery Center — I'm opening it for you now.";

/**
 * Streams the architect's reply for a session, reporting the text as it
 * arrives and returning it once complete. Same NDJSON contract the typed
 * composer and the discovery voice loop consume.
 */
async function streamReply(
  publicId: string,
  onText: (text: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: publicId, resume: true }),
  });
  if (!res.ok || !res.body) throw new Error("The architect could not respond.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    // Trailing element is a partial line; keep it for the next chunk.
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as {
        type: string;
        text?: string;
        error?: string;
      };
      if (event.type === "text" && event.text) {
        text += event.text;
        onText(text);
      }
      if (event.type === "error" && event.error) throw new Error(event.error);
    }
  }

  return text.trim();
}

/**
 * The "AI Listening" overlay. Audio is recorded here and transcribed by
 * ElevenLabs Scribe through /api/transcribe; a browser without MediaRecorder
 * degrades to a typed-entry prompt rather than pretending to listen.
 *
 * It answers the first question here rather than only transcribing it. The
 * visitor asks, the architect replies out loud, and the modal then hands the
 * same session to /discovery with both turns already in it — so the page they
 * land on continues a conversation instead of starting one.
 */
export function VoiceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [finalLines, setFinalLines] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Set when the browser will not prompt again on its own, so the UI can say
  // where the switch is instead of offering a retry that silently re-fails.
  const [needsSettings, setNeedsSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** The architect's answer, streamed in and spoken before the handoff. */
  const [reply, setReply] = useState("");

  const speech = useSpeech();
  const dictation = useDictation(
    useCallback((text: string) => setFinalLines((lines) => [...lines, text]), []),
  );
  const listening = dictation.listening;

  /**
   * Pulled by the orb each frame; keeps amplitude out of React state. Reading
   * the spoken level first means the orb follows the architect while it is
   * answering and the visitor the rest of the time.
   */
  const readLevel = useCallback(() => {
    const spoken = speech.readLevel();
    return spoken > 0.01 ? spoken : dictation.readLevel();
  }, [speech, dictation]);

  // `dictation.stop` keeps a stable identity, so this one does too — which
  // matters because the effect that opens the microphone is keyed on `start`.
  const stopEverything = dictation.stop;

  // Escape closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => stopEverything(), [stopEverything]);

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [listening]);

  const dictationStart = dictation.start;
  const start = useCallback(async () => {
    setError(null);

    if (!hasRecording()) {
      setSupported(false);
      return;
    }
    setSupported(true);

    // The architect answers out loud in this modal, and playback needs the
    // AudioContext unlocked by a gesture. Opening the modal was that gesture;
    // waiting until the reply arrives is too late.
    await resumeAudioContext();

    const started = await dictationStart();
    if (!started.ok) {
      setError(started.message);
      setNeedsSettings(started.needsBrowserSettings);
      return;
    }
    setNeedsSettings(false);
  }, [dictationStart]);

  // Deferred a tick: `start` flips state as it opens the mic, and doing that
  // synchronously inside the effect body cascades an extra render.
  useEffect(() => {
    const id = setTimeout(() => void start(), 0);
    return () => clearTimeout(id);
  }, [start]);

  const transcript = finalLines.join(" ").trim();

  // The silence timer fires long after the render that scheduled it, so what
  // it needs has to be reachable through refs rather than closed over.
  const transcriptRef = useRef(transcript);
  const speechRef = useRef(speech);
  const submittingRef = useRef(false);
  useEffect(() => {
    transcriptRef.current = transcript;
    speechRef.current = speech;
  });

  /**
   * Answers the question out loud, then hands the session to /discovery.
   *
   * The reply is generated with `resume: true` against the message that
   * /api/sessions just stored, so the turn is persisted exactly once. By the
   * time the discovery page mounts it finds a client message *and* an answer,
   * which is what stops its own opening effect answering the same question a
   * second time.
   */
  const answerAndHandOff = useCallback(async () => {
    const message = transcriptRef.current;
    if (!message || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    // Release the microphone before the architect speaks, or recognition
    // transcribes its voice straight back as the visitor's.
    stopEverything();

    let publicId: string | null = null;
    try {
      const created = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!created.ok) throw new Error("Could not start the session");
      publicId = ((await created.json()) as { publicId: string }).publicId;

      const answer = await streamReply(publicId, setReply);

      // Spoken as one utterance rather than two: a second /api/speech round
      // trip would leave a hole of silence exactly where the visitor is
      // deciding whether this thing works.
      const spoken = answer ? `${answer} ${HANDOFF_LINE}` : HANDOFF_LINE;
      setReply(spoken);
      await speechRef.current.speak(spoken);
    } catch {
      // Losing the answer is recoverable; losing the session is not. If one
      // exists, go there anyway — the discovery page answers an unanswered
      // opening message on mount, so the visitor still gets their reply.
      if (!publicId) {
        setError("Could not reach the AI Architect. Please try again.");
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }
    }

    onClose();
    router.push(`/discovery/${publicId}`);
  }, [onClose, router, stopEverything]);

  // The architect takes its turn once the visitor stops talking. Each new
  // transcribed sentence reschedules this, so a pause for breath mid-thought
  // does not cut them off — and it never fires while a clip is still being
  // transcribed, or the handoff would carry an unfinished question.
  useEffect(() => {
    if (submitting || dictation.transcribing || finalLines.length === 0) return;
    const id = setTimeout(() => void answerAndHandOff(), REPLY_AFTER_SILENCE_MS);
    return () => clearTimeout(id);
  }, [submitting, dictation.transcribing, finalLines, answerAndHandOff]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

  const orbState: OrbState = speech.speaking
    ? "speaking"
    : submitting
      ? "thinking"
      : listening
        ? "listening"
        : "idle";

  const status = speech.speaking
    ? "Answering…"
    : submitting
      ? "Thinking…"
      : listening
        ? "Listening…"
        : "Paused";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Talk to the AI Architect"
      className="fixed inset-0 z-[60] flex items-center justify-center px-6 py-20 overflow-y-auto bg-ink/95 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                listening || submitting
                  ? "bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  : "bg-gray-600"
              }`}
            />
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
              {status}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs font-mono">{mmss}</span>
            <button
              type="button"
              onClick={() => {
                stopEverything();
                onClose();
              }}
              aria-label="Close voice input"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all"
            >
              <Icon name="xmark" className="text-xs" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-10">
          <p className="text-gray-400 text-sm mb-8 tracking-wide">
            What Are You Trying To Build?
          </p>

          {/* The orb pulls amplitude through a ref rather than receiving it as
              a prop, so it animates at frame rate without re-rendering this
              modal 60 times a second. */}
          <VoiceOrb
            state={orbState}
            readLevel={readLevel}
            size={300}
            className="mb-8"
          />
        </div>

        <div className="glass rounded-2xl p-6 mb-6 border-cyan-500/15">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Live Transcript
            </span>
            <span className="text-xs text-gray-500 font-mono">AI Architect</span>
          </div>
          <div className="space-y-3 min-h-24" aria-live="polite">
            {finalLines.map((line, i) => (
              <p
                key={i}
                className="text-white text-lg leading-relaxed font-light"
              >
                {line}
              </p>
            ))}
            {/* Scribe transcribes a finished clip, so there are no interim
                words to show. Saying the sentence is being written is the
                honest version of the old blinking caret. */}
            {dictation.transcribing && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-base italic">
                  Writing that down…
                </span>
                <span className="w-0.5 h-5 bg-cyan-400 rounded animate-blink" />
              </div>
            )}
            {reply && (
              <p className="text-cyan-100 text-base leading-relaxed border-l-2 border-cyan-500/40 pl-4">
                {reply}
              </p>
            )}

            {!transcript && !reply && (
              <p className="text-gray-600 italic text-sm">
                {supported === false
                  ? "This browser can't record audio. Switch to text and describe your project instead."
                  : "Start describing your business and what you're trying to accomplish…"}
              </p>
            )}
          </div>
        </div>

        {/* The microphone, the transcriber and the voice each fail in their
            own way; to the visitor they are one thing that stopped working. */}
        {(error ?? dictation.error ?? speech.error) && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-xs text-amber-300 flex flex-wrap items-center gap-3"
          >
            <Icon name="triangle-exclamation" className="shrink-0" />
            <span className="flex-1 min-w-48 leading-relaxed">
              {error ?? dictation.error ?? speech.error}
            </span>

            {/* A denial used to be a dead end — the modal said "blocked" and
                offered nothing. Retry is still useful after the visitor flips
                the switch in site settings, since the browser itself will not
                re-prompt. */}
            {!listening && (
              <button
                type="button"
                onClick={() => void start()}
                className="shrink-0 px-4 py-2 rounded-full border border-amber-400/40 text-amber-200 hover:bg-amber-400/10 transition-colors font-semibold"
              >
                <Icon name="rotate-right" className="mr-1.5" />
                {needsSettings ? "I've allowed it — retry" : "Try again"}
              </button>
            )}
          </div>
        )}

        <div className="glass-dark rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Icon name="brain" className="text-xs text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {transcript
                  ? "Ready to hand this to the AI Architect"
                  : "AI Architect is standing by…"}
              </p>
              <p className="text-xs text-gray-500">
                Identifying technology requirements in real time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" aria-hidden="true">
            {[0, 0.1, 0.2].map((d) => (
              <div
                key={d}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <button
            type="button"
            onClick={() => {
              stopEverything();
              onClose();
              router.push("/discovery");
            }}
            className="px-6 py-3 glass-dark rounded-full text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Icon name="keyboard" className="text-xs" /> Switch to Text
          </button>

          <button
            type="button"
            onClick={
              listening ? () => void answerAndHandOff() : () => void start()
            }
            disabled={submitting || (listening && !transcript)}
            aria-label={
              listening ? "Stop recording and get an answer" : "Start recording"
            }
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Icon name="spinner" spin className="text-red-300" />
            ) : listening ? (
              <div className="w-5 h-5 bg-red-400 rounded-sm group-hover:scale-110 transition-transform" />
            ) : (
              <Icon name="microphone" className="text-red-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              stopEverything();
              onClose();
              router.push("/discovery?mode=upload");
            }}
            className="px-6 py-3 glass-dark rounded-full text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Icon name="file-arrow-up" className="text-xs" /> Upload Docs
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">
          {submitting
            ? "The architect is answering, then it will open the Discovery Center"
            : listening
              ? "Pause for a moment when you're done — the architect will answer"
              : "Tap the microphone to start"}{" "}
          • Your session is private
        </p>
      </div>
    </div>
  );
}
