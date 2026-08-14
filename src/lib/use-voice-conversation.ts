"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resumeAudioContext } from "@/lib/audio-level";
import { useDictation } from "@/lib/use-dictation";
import { useSpeech } from "@/lib/use-speech";

export type ConversationState = "idle" | "listening" | "thinking" | "speaking";

export type ConversationTurn = {
  role: "user" | "assistant";
  text: string;
};

/**
 * The analysis Claude refreshes after each turn — industry, clarity score,
 * modules, open questions. Structurally identical to the workspace's
 * `SessionAnalysis`; kept as an index type here so this hook does not reach
 * into a component's type module.
 */
export type AnalysisPatch = Record<string, unknown>;

/**
 * The spoken conversation loop: microphone → Scribe → Claude → ElevenLabs → orb.
 *
 * Claude remains the architect. This drives the existing `/api/chat` stream
 * exactly as the typed composer does, so the system prompt, the guardrails,
 * the requirement tracking and the summary pipeline all behave identically
 * whether the visitor spoke or typed. The only addition is that the reply is
 * also spoken, and that both voices feed an amplitude the orb can render.
 *
 * Transcription goes through /api/transcribe (ElevenLabs Scribe) rather than
 * the browser's Web Speech API — see use-dictation.ts for why.
 */
export function useVoiceConversation(
  sessionId: string,
  onAnalysis?: (analysis: AnalysisPatch) => void,
) {
  const [state, setState] = useState<ConversationState>("idle");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Read inside the stream loop, which outlives the render that started it.
  const onAnalysisRef = useRef(onAnalysis);
  useEffect(() => {
    onAnalysisRef.current = onAnalysis;
  });

  const micLevelRef = useRef(0);
  // Guards against a late transcription restarting a torn-down loop.
  const activeRef = useRef(false);

  const speech = useSpeech();

  /** Sends a finished utterance to Claude, then speaks the reply. */
  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || !activeRef.current) return;

      setTurns((prev) => [...prev, { role: "user", text: message }]);
      setState("thinking");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message }),
        });

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "The architect could not respond.",
          );
        }

        // Same NDJSON contract the typed composer consumes.
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let reply = "";

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
              analysis?: AnalysisPatch;
              error?: string;
            };
            if (event.type === "text" && event.text) reply += event.text;
            // The point of the Live Analysis panel is that it fills in while
            // the client talks. Dropping these events on the floor is what
            // left it frozen through an entire spoken conversation.
            if (event.type === "analysis" && event.analysis) {
              onAnalysisRef.current?.(event.analysis);
            }
            if (event.type === "error" && event.error) throw new Error(event.error);
          }
        }

        if (!activeRef.current) return;
        setTurns((prev) => [...prev, { role: "assistant", text: reply }]);
        setState("speaking");
        await speech.speak(reply);
      } catch (err) {
        if (!activeRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. You can keep typing instead.",
        );
        setState("idle");
      }
    },
    [sessionId, speech],
  );

  // `send` changes identity whenever the speech hook re-renders, and the
  // dictation callback is installed once — so route through a ref.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });

  const dictation = useDictation(
    useCallback((text: string) => void sendRef.current(text), []),
  );

  /**
   * One level for the orb, whichever side is talking. Reading the speaking
   * amplitude first means the orb follows the architect while it replies and
   * the visitor the rest of the time, without the caller tracking which.
   */
  const readLevel = useCallback(() => {
    const spoken = speech.readLevel();
    return spoken > 0.01 ? spoken : dictation.readLevel();
  }, [speech, dictation]);

  const teardown = useCallback(() => {
    activeRef.current = false;
    dictation.stop();
    speech.stop();
    micLevelRef.current = 0;
    setState("idle");
  }, [dictation, speech]);

  // Deliberately not `[teardown]`: that identity changes on every render, and
  // an effect keyed on it would tear the conversation down mid-sentence. This
  // only needs to run when the component actually goes away.
  const teardownRef = useRef(teardown);
  useEffect(() => {
    teardownRef.current = teardown;
  });
  useEffect(() => () => teardownRef.current(), []);

  const start = useCallback(async () => {
    setError(null);

    // Playback needs the AudioContext unlocked, and this click is the gesture
    // that does it. Deferring until the first reply is too late — by then the
    // gesture has passed and the browser blocks the audio.
    await resumeAudioContext();

    const started = await dictation.start();
    if (!started.ok) {
      setError(started.message);
      return;
    }

    activeRef.current = true;
    setState("listening");
  }, [dictation]);

  /**
   * The microphone must not be recording while the speakers are playing, or
   * the architect's own voice comes back as the visitor's next utterance.
   * Web Speech used to duck this by accident; recording has to be explicit.
   */
  useEffect(() => {
    if (!activeRef.current) return;
    if (speech.speaking) {
      dictation.pause();
    } else {
      dictation.resume();
    }
  }, [speech.speaking, dictation]);

  // Return to listening once the architect stops talking.
  useEffect(() => {
    if (state === "speaking" && !speech.speaking && activeRef.current) {
      setState("listening");
    }
  }, [state, speech.speaking]);

  return {
    state,
    turns,
    // Scribe has no interim results, so the live line says the sentence is
    // being written rather than showing words appearing.
    interim: dictation.transcribing ? "Transcribing…" : "",
    // A microphone fault, a transcription fault and a voice fault land in the
    // same notice. They mean one thing to the visitor — part of this is not
    // working, the text still is — and three amber boxes would say it thrice.
    error: error ?? dictation.error ?? speech.error,
    start,
    stop: teardown,
    readLevel,
    voiceAvailable: speech.available,
  };
}
