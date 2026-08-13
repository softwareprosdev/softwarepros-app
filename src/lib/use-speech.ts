"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { meterFromElement, resumeAudioContext } from "@/lib/audio-level";

/**
 * Lazily creates the shared <audio> element and points it at a new clip.
 *
 * Lives outside the hook because the React Compiler treats a local alias of
 * `ref.current` as an immutable hook value and rejects assigning to it. The
 * element genuinely is mutable state we own, so the mutation happens here
 * where the compiler is not tracking it.
 */
function attachSource(
  ref: React.RefObject<HTMLAudioElement | null>,
  blob: Blob,
): HTMLAudioElement {
  if (!ref.current) {
    const created = new Audio();
    created.preload = "auto";
    ref.current = created;
  }
  const el = ref.current;
  if (el.src.startsWith("blob:")) URL.revokeObjectURL(el.src);
  el.src = URL.createObjectURL(blob);
  return el;
}

/**
 * Speaks text through `/api/speech` (ElevenLabs) and exposes the playback
 * amplitude so the orb can react to the architect's voice.
 *
 * Degrades silently by design: if ELEVENLABS_API_KEY is unset the route
 * answers 503, `speak()` resolves without audio, and the conversation
 * continues in text. A missing voice should never break the product.
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const meterRef = useRef<{ read: () => number; dispose: () => void } | null>(
    null,
  );
  const levelRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);

  /** Read by the orb every frame; deliberately a ref, not state. */
  const readLevel = useCallback(() => levelRef.current, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const el = audioRef.current;
    if (el) {
      el.pause();
      // Revoke before dropping the reference or the blob leaks for the
      // lifetime of the document.
      if (el.src.startsWith("blob:")) URL.revokeObjectURL(el.src);
      el.removeAttribute("src");
    }
    levelRef.current = 0;
    setSpeaking(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Barge-in: a new utterance always cancels the one in flight, so the
      // architect never talks over itself when replies arrive quickly.
      stop();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // The route caps length too; trimming here avoids paying to
          // synthesize characters the server would reject anyway.
          body: JSON.stringify({ text: trimmed.slice(0, 2500) }),
          signal: controller.signal,
        });

        if (!res.ok) {
          // 503 means voice was never configured — stop trying for the rest
          // of the session rather than a failed round trip per turn.
          if (res.status === 503) setAvailable(false);
          return;
        }

        const blob = await res.blob();
        if (controller.signal.aborted) return;

        await resumeAudioContext();

        // One <audio> element reused for every utterance:
        // createMediaElementSource can only be called once per element.
        const el = attachSource(audioRef, blob);

        if (!meterRef.current) meterRef.current = meterFromElement(el);

        const tick = () => {
          levelRef.current = meterRef.current?.read() ?? 0;
          rafRef.current = requestAnimationFrame(tick);
        };

        el.onended = () => {
          levelRef.current = 0;
          setSpeaking(false);
          if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        };

        setSpeaking(true);
        rafRef.current = requestAnimationFrame(tick);
        await el.play();
      } catch {
        // Aborted, blocked by autoplay policy, or the network failed. None of
        // these should surface as an error — the reply is on screen as text.
        setSpeaking(false);
      }
    },
    [stop],
  );

  return { speak, stop, speaking, available, readLevel };
}
