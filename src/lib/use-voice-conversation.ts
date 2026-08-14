"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { meterFromStream, resumeAudioContext } from "@/lib/audio-level";
import {
  describeRecognitionError,
  requestMicrophone,
  hasSpeechRecognition,
} from "@/lib/microphone";
import { useSpeech } from "@/lib/use-speech";

export type ConversationState = "idle" | "listening" | "thinking" | "speaking";

export type ConversationTurn = {
  role: "user" | "assistant";
  text: string;
};

/**
 * The spoken conversation loop: microphone → Claude → ElevenLabs → orb.
 *
 * Claude remains the architect. This drives the existing `/api/chat` stream
 * exactly as the typed composer does, so the system prompt, the guardrails,
 * the requirement tracking and the summary pipeline all behave identically
 * whether the visitor spoke or typed. The only addition is that the reply is
 * also spoken, and that both voices feed an amplitude the orb can render.
 */
export function useVoiceConversation(sessionId: string) {
  const [state, setState] = useState<ConversationState>("idle");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const micMeterRef = useRef<{ read: () => number; dispose: () => void } | null>(
    null,
  );
  const micStreamRef = useRef<MediaStream | null>(null);
  const micLevelRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  // Guards against a late recognition result restarting a torn-down loop.
  const activeRef = useRef(false);

  const speech = useSpeech();

  /**
   * One level for the orb, whichever side is talking. Reading the speaking
   * amplitude first means the orb follows the architect while it replies and
   * the visitor the rest of the time, without the caller tracking which.
   */
  const readLevel = useCallback(() => {
    const spoken = speech.readLevel();
    return spoken > 0.01 ? spoken : micLevelRef.current;
  }, [speech]);

  const teardown = useCallback(() => {
    activeRef.current = false;
    // Detach handlers before stopping: `onend` would otherwise fire during
    // teardown and restart recognition we are trying to shut down.
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.stop();
    }
    recognitionRef.current = null;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    micMeterRef.current?.dispose();
    micMeterRef.current = null;
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    micLevelRef.current = 0;

    speech.stop();
    setState("idle");
    setInterim("");
  }, [speech]);

  useEffect(() => () => teardown(), [teardown]);

  /** Sends a finished utterance to Claude, then speaks the reply. */
  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message) return;

      setTurns((prev) => [...prev, { role: "user", text: message }]);
      setInterim("");
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
              error?: string;
            };
            if (event.type === "text" && event.text) reply += event.text;
            if (event.type === "error" && event.error) throw new Error(event.error);
          }
        }

        if (!activeRef.current) return;
        setTurns((prev) => [...prev, { role: "assistant", text: reply }]);

        // Speak first, then resume listening on completion, so the microphone
        // is not open while the speakers are playing — otherwise recognition
        // transcribes the architect's own voice back as the visitor's.
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

  const start = useCallback(async () => {
    setError(null);

    if (!hasSpeechRecognition()) {
      setError(
        "This browser can't transcribe speech. Try Chrome, Edge, or Safari — or type your project instead.",
      );
      return;
    }

    const mic = await requestMicrophone();
    if (!mic.ok) {
      setError(mic.message);
      return;
    }

    // Playback needs the AudioContext unlocked, and this click is the gesture
    // that does it. Deferring until the first reply is too late — by then the
    // gesture has passed and the browser blocks the audio.
    await resumeAudioContext();

    activeRef.current = true;
    micStreamRef.current = mic.stream;
    micMeterRef.current = meterFromStream(mic.stream);

    const tick = () => {
      micLevelRef.current = micMeterRef.current?.read() ?? 0;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // `hasSpeechRecognition()` above already established this exists; the
    // guard is for the type checker, which cannot carry that across the await.
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          void send(result[0].transcript);
        } else {
          live += result[0].transcript;
        }
      }
      setInterim(live);
    };

    recognition.onerror = (event) => {
      // no-speech and aborted are ordinary pauses, so the classifier returns
      // null for them and the loop keeps running. Anything else ends the
      // session — `onend` would otherwise restart into the same failure.
      if (event.error === "no-speech" || event.error === "aborted") return;

      // Stop the restart loop now, synchronously. `onend` fires immediately
      // after this handler, and classifying the error takes a microtask —
      // long enough for the loop to restart into the same failure.
      activeRef.current = false;
      void describeRecognitionError(event.error).then((outcome) => {
        if (!outcome) return;
        setError(outcome.message);
        teardown();
      });
    };

    recognition.onend = () => {
      // Chrome ends continuous recognition after a silence regardless of the
      // flag, so it is restarted for as long as the conversation is open.
      if (activeRef.current) {
        try {
          recognition.start();
        } catch {
          // Already restarting — harmless.
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setState("listening");
  }, [send, teardown]);

  // Return to listening once the architect stops talking.
  useEffect(() => {
    if (state === "speaking" && !speech.speaking && activeRef.current) {
      setState("listening");
    }
  }, [state, speech.speaking]);

  return {
    state,
    turns,
    interim,
    error,
    start,
    stop: teardown,
    readLevel,
    voiceAvailable: speech.available,
  };
}
