"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { meterFromStream } from "@/lib/audio-level";
import { requestMicrophone } from "@/lib/microphone";

/**
 * Dictation through ElevenLabs Scribe instead of the browser's Web Speech API.
 *
 * The browser API streamed audio to the vendor's own speech service, which
 * meant `network` errors on healthy connections, nothing at all in several
 * Chromium forks, and a hard stop behind privacy extensions — none of it
 * fixable from this codebase. Recording locally and posting the clip to
 * /api/transcribe puts the whole voice loop on one vendor we already pay.
 *
 * The trade-off is honest: Scribe transcribes a finished clip, so there are no
 * interim words appearing as you speak. `transcribing` is exposed so the UI
 * can say the sentence is being written rather than appearing to have missed
 * it.
 */

/**
 * Level is `min(1, rms * 3.2)` (see audio-level.ts). Speech lands around
 * 0.16–0.96, room tone under ~0.06, so this sits above the noise floor of a
 * normal room without needing calibration.
 */
const SPEECH_LEVEL = 0.12;

/** Quiet for this long and the sentence is treated as finished. */
const SILENCE_MS = 1100;

/** Shorter than this is a cough, a chair, or a door. Not worth paying for. */
const MIN_UTTERANCE_MS = 350;

/**
 * A hard ceiling on one clip, so a visitor who never pauses still gets
 * transcribed — and so a stuck-open microphone cannot bill for an hour.
 */
const MAX_UTTERANCE_MS = 30_000;

export type DictationStart =
  | { ok: true }
  | { ok: false; message: string; needsBrowserSettings: boolean };

/** Preferred first; the first supported entry wins. Safari only has mp4. */
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function hasRecording(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function useDictation(onUtterance: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const meterRef = useRef<{ read: () => number; dispose: () => void } | null>(
    null,
  );
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);

  const levelRef = useRef(0);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  /** Whether speech has been heard in the clip currently being recorded. */
  const heardRef = useRef(false);
  const lastLoudRef = useRef(0);
  const startedAtRef = useRef(0);
  /** Set when a clip ended on a real pause, so `onstop` knows to upload it. */
  const keepRef = useRef(false);

  // The recorder callbacks outlive the render that created them.
  const onUtteranceRef = useRef(onUtterance);
  useEffect(() => {
    onUtteranceRef.current = onUtterance;
  });

  const readLevel = useCallback(() => levelRef.current, []);

  const upload = useCallback(async (clip: Blob) => {
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append("audio", clip, "utterance.webm");

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "error" in body
            ? (body as { error: unknown }).error
            : null;
        setError(
          typeof message === "string"
            ? message
            : "Dictation is unavailable right now — you can type instead.",
        );
        return;
      }

      const { text } = (await res.json()) as { text?: string };
      if (text?.trim()) {
        // A clip that came back with words is proof the path works, so clear
        // any warning left over from an earlier one.
        setError(null);
        onUtteranceRef.current(text.trim());
      }
    } catch {
      setError("Couldn't send that recording — you can type instead.");
    } finally {
      setTranscribing(false);
    }
  }, []);

  /**
   * The next clip is opened from inside the previous one's `onstop`, so the
   * recursion goes through a ref: a `useCallback` cannot name itself, and the
   * handler outlives the render that installed it either way.
   */
  const openRecorderRef = useRef<(stream: MediaStream) => void>(() => {});

  /**
   * Records one clip. Each utterance gets its own recorder: `onstop` uploads
   * what was captured and immediately opens the next one, so the gap between
   * sentences is a few milliseconds rather than a round trip.
   */
  const openRecorder = useCallback(
    (stream: MediaStream) => {
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        chunksRef.current = [];

        if (keepRef.current && chunks.length) {
          void upload(new Blob(chunks, { type: recorder.mimeType }));
        }
        keepRef.current = false;

        if (activeRef.current && !pausedRef.current) {
          openRecorderRef.current(stream);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      heardRef.current = false;
      startedAtRef.current = performance.now();
    },
    [upload],
  );

  useEffect(() => {
    openRecorderRef.current = openRecorder;
  });

  /** Ends the current clip; `keep` decides whether it gets transcribed. */
  const closeClip = useCallback((keep: boolean) => {
    keepRef.current = keep;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    pausedRef.current = false;

    closeClip(false);

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    meterRef.current?.dispose();
    meterRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    levelRef.current = 0;

    setListening(false);
  }, [closeClip]);

  useEffect(() => () => stop(), [stop]);

  /**
   * Stops capturing without giving up the microphone — used while the
   * architect is speaking, so its own voice is never recorded and sent back
   * for transcription. Re-acquiring the device each turn would be slower and
   * can re-trigger the browser's in-use indicator.
   */
  const pause = useCallback(() => {
    if (!activeRef.current || pausedRef.current) return;
    pausedRef.current = true;
    closeClip(false);
    levelRef.current = 0;
  }, [closeClip]);

  const resume = useCallback(() => {
    if (!activeRef.current || !pausedRef.current) return;
    pausedRef.current = false;
    const stream = streamRef.current;
    if (stream) openRecorder(stream);
  }, [openRecorder]);

  const start = useCallback(async (): Promise<DictationStart> => {
    setError(null);

    if (!hasRecording()) {
      const message =
        "This browser can't record audio, so dictation isn't available — you can type instead.";
      setError(message);
      return { ok: false, message, needsBrowserSettings: false };
    }

    // Already running: treat as a no-op rather than opening a second stream.
    if (activeRef.current) return { ok: true };

    const mic = await requestMicrophone();
    if (!mic.ok) {
      setError(mic.message);
      return {
        ok: false,
        message: mic.message,
        needsBrowserSettings: mic.needsBrowserSettings,
      };
    }

    activeRef.current = true;
    pausedRef.current = false;
    streamRef.current = mic.stream;
    meterRef.current = meterFromStream(mic.stream);
    lastLoudRef.current = performance.now();

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      const level = meterRef.current?.read() ?? 0;
      levelRef.current = pausedRef.current ? 0 : level;
      if (pausedRef.current || !recorderRef.current) return;

      const now = performance.now();
      if (level > SPEECH_LEVEL) {
        lastLoudRef.current = now;
        heardRef.current = true;
      }

      if (!heardRef.current) {
        // Nothing said yet. Keep the clip's start time close to the first
        // word so MAX_UTTERANCE_MS measures speech, not waiting.
        startedAtRef.current = now;
        return;
      }

      const quietFor = now - lastLoudRef.current;
      const spokenFor = now - startedAtRef.current;

      if (quietFor > SILENCE_MS) {
        closeClip(spokenFor > MIN_UTTERANCE_MS);
      } else if (spokenFor > MAX_UTTERANCE_MS) {
        closeClip(true);
      }
    };

    openRecorder(mic.stream);
    rafRef.current = requestAnimationFrame(tick);
    setListening(true);
    return { ok: true };
  }, [closeClip, openRecorder]);

  return {
    start,
    stop,
    pause,
    resume,
    listening,
    transcribing,
    error,
    setError,
    readLevel,
  };
}
