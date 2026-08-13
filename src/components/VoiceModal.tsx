"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { requestMicrophone } from "@/lib/microphone";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

const BAR_COUNT = 40;

/**
 * The "AI Listening" overlay. Speech recognition runs in the browser where it's
 * available (Chrome/Edge/Safari); everywhere else the modal degrades to a
 * typed-entry prompt rather than pretending to listen.
 */
export function VoiceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [finalLines, setFinalLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 8),
  );
  const [error, setError] = useState<string | null>(null);
  // Set when the browser will not prompt again on its own, so the UI can say
  // where the switch is instead of offering a retry that silently re-fails.
  const [needsSettings, setNeedsSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopEverything = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setListening(false);
  }, []);

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

  const start = useCallback(async () => {
    setError(null);
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      return;
    }
    setSupported(true);

    // Live mic level drives the waveform, so the bars reflect real speech.
    const mic = await requestMicrophone();
    if (!mic.ok) {
      setError(mic.message);
      setNeedsSettings(mic.needsBrowserSettings);
      return;
    }
    setNeedsSettings(false);

    try {
      const stream = mic.stream;
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const next = Array.from({ length: BAR_COUNT }, (_, i) => {
          const v = data[Math.floor((i / BAR_COUNT) * data.length)] ?? 0;
          return 8 + (v / 255) * 64;
        });
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // The permission was granted — this is the Web Audio graph failing, so
      // the waveform is lost but transcription can still proceed.
      setError(
        "Couldn't read the microphone level, so the waveform is disabled. Dictation should still work.",
      );
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          setFinalLines((lines) => [...lines, text.trim()]);
        } else {
          live += text;
        }
      }
      setInterim(live);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech recognition stopped: ${event.error}`);
      }
    };
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }, []);

  // Deferred a tick: `start` flips state as it opens the mic, and doing that
  // synchronously inside the effect body cascades an extra render.
  useEffect(() => {
    const id = setTimeout(() => void start(), 0);
    return () => clearTimeout(id);
  }, [start]);

  const transcript = [...finalLines, interim].join(" ").trim();

  async function handOffToChat() {
    if (!transcript || submitting) return;
    setSubmitting(true);
    stopEverything();
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript }),
      });
      if (!res.ok) throw new Error("Could not start the session");
      const { publicId } = await res.json();
      onClose();
      router.push(`/discovery/${publicId}`);
    } catch {
      setError("Could not start a discovery session. Please try again.");
      setSubmitting(false);
    }
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

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
                listening
                  ? "bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  : "bg-gray-600"
              }`}
            />
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
              {listening ? "Listening…" : "Paused"}
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

          <div className="relative flex items-center justify-center mb-10">
            <div className="absolute w-64 h-64 rounded-full border border-cyan-500/10 animate-pulse-soft" />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/15 animate-pulse-soft [animation-delay:0.5s]" />
            <div className="absolute w-36 h-36 rounded-full border border-cyan-500/25" />
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center relative z-10"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #1e40af, #050508)",
                boxShadow:
                  "0 0 60px rgba(14,165,233,0.4), inset 0 0 30px rgba(6,182,212,0.1)",
              }}
            >
              <Icon name="microphone" className="text-4xl text-cyan-300" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 h-20" aria-hidden="true">
            {levels.map((h, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{ height: `${listening ? h : 6}px` }}
              />
            ))}
          </div>
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
            {interim && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-lg">{interim}</span>
                <span className="w-0.5 h-5 bg-cyan-400 rounded animate-blink" />
              </div>
            )}
            {!transcript && (
              <p className="text-gray-600 italic text-sm">
                {supported === false
                  ? "Your browser doesn't support in-browser speech recognition. Switch to text and describe your project instead."
                  : "Start describing your business and what you're trying to accomplish…"}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-xs text-amber-300 flex flex-wrap items-center gap-3"
          >
            <Icon name="triangle-exclamation" className="shrink-0" />
            <span className="flex-1 min-w-48 leading-relaxed">{error}</span>

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
            onClick={listening ? handOffToChat : () => void start()}
            disabled={submitting || (listening && !transcript)}
            aria-label={listening ? "Stop recording and continue" : "Start recording"}
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
          {listening
            ? "Tap the square to stop and hand off to the AI Architect"
            : "Tap the microphone to start"}{" "}
          • Your session is private
        </p>
      </div>
    </div>
  );
}
