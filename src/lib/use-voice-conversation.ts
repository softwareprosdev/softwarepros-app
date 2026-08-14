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

/**
 * How many `network` dropouts to ride out before telling the visitor. Chrome
 * raises these on healthy connections; one is noise, a run of them is a fault.
 */
const NETWORK_RETRY_LIMIT = 3;
const RESTART_BACKOFF_MS = 800;

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
  /**
   * Whether recognition should keep restarting. Deliberately separate from
   * `activeRef`: the microphone failing must not cancel a turn already handed
   * to Claude. Conflating the two meant a dropped transcription threw away the
   * visitor's sentence *and* the reply it had already earned.
   */
  const listeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const networkRetriesRef = useRef(0);

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

  /**
   * Releases the microphone and stops recognition, leaving the conversation
   * itself alone: an in-flight reply still arrives, and still gets spoken.
   */
  const stopListening = useCallback(() => {
    listeningRef.current = false;

    if (restartTimerRef.current !== null) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;

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

    setInterim("");
  }, []);

  const teardown = useCallback(() => {
    activeRef.current = false;
    stopListening();
    speech.stop();
    setState("idle");
  }, [speech, stopListening]);

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
    listeningRef.current = true;
    networkRetriesRef.current = 0;
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
          // Transcription is working, so any earlier dropout was a blip and
          // the next one deserves a fresh allowance rather than the tail of
          // an old one.
          networkRetriesRef.current = 0;
          void send(result[0].transcript);
        } else {
          live += result[0].transcript;
        }
      }
      setInterim(live);
    };

    recognition.onerror = (event) => {
      // no-speech and aborted are ordinary pauses, so the classifier returns
      // null for them and the loop keeps running.
      if (event.error === "no-speech" || event.error === "aborted") return;

      // `network` means the browser's speech backend dropped out, and on a
      // long dictation Chrome raises it routinely — mid-sentence, after
      // minutes of clean transcription, on a connection that is plainly fine.
      // Treating the first one as fatal ended conversations that would have
      // continued if simply restarted, so it is only reported once it keeps
      // happening.
      if (
        event.error === "network" &&
        networkRetriesRef.current < NETWORK_RETRY_LIMIT
      ) {
        networkRetriesRef.current += 1;
        return;
      }

      // Stop the restart loop now, synchronously. `onend` fires immediately
      // after this handler, and classifying the error takes a microtask —
      // long enough for the loop to restart into the same failure.
      //
      // Note this stops *listening*, not the conversation: `activeRef` stays
      // set, so a sentence already sent to Claude still gets its reply.
      listeningRef.current = false;
      void describeRecognitionError(event.error).then((outcome) => {
        if (!outcome) return;
        setError(outcome.message);
        stopListening();
        // Leave a turn in progress alone; it owns the state until it finishes.
        setState((current) =>
          current === "thinking" || current === "speaking" ? current : "idle",
        );
      });
    };

    recognition.onend = () => {
      // Chrome ends continuous recognition after a silence regardless of the
      // flag, so it is restarted for as long as the conversation is open.
      if (!activeRef.current || !listeningRef.current) return;

      // Restarting instantly after a dropout just re-fails and burns the
      // retry allowance in under a second; give the backend a moment.
      const delay = networkRetriesRef.current > 0 ? RESTART_BACKOFF_MS : 0;
      restartTimerRef.current = setTimeout(() => {
        if (!activeRef.current || !listeningRef.current) return;
        try {
          recognition.start();
        } catch {
          // Already restarting — harmless.
        }
      }, delay);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setState("listening");
  }, [send, stopListening]);

  // Return to listening once the architect stops talking — unless the
  // microphone died while it was talking, in which case claiming to listen
  // would be a lie.
  useEffect(() => {
    if (state === "speaking" && !speech.speaking && activeRef.current) {
      setState(listeningRef.current ? "listening" : "idle");
    }
  }, [state, speech.speaking]);

  return {
    state,
    turns,
    interim,
    // A microphone fault and a voice fault land in the same notice. Both mean
    // the same thing to the visitor — part of this is not working, the text
    // still is — and two amber boxes would say it twice.
    error: error ?? speech.error,
    start,
    stop: teardown,
    readLevel,
    voiceAvailable: speech.available,
  };
}
