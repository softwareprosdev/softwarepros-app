/**
 * Shared audio-amplitude plumbing for the voice UI.
 *
 * The orb has to react to two different sources — the visitor's microphone
 * while they speak, and the architect's synthesized reply while it plays —
 * and both go through the same analyser shape so the orb only ever sees a
 * single 0..1 number and does not care which is talking.
 *
 * Client-side only.
 */

export type LevelMeter = {
  /** Current amplitude, 0..1. Safe to poll every frame. */
  read: () => number;
  /** Releases the analyser and, if we own it, the AudioContext. */
  dispose: () => void;
};

/**
 * One AudioContext for the whole page.
 *
 * Browsers cap how many can exist, and Safari in particular leaks them —
 * creating one per utterance eventually throws and kills audio for the rest
 * of the session. It also starts suspended until a gesture, which is why
 * `resume()` is called on use rather than at construction.
 */
let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

/** Autoplay policy suspends the context until a user gesture unlocks it. */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => {});
  }
}

function buildMeter(
  ctx: AudioContext,
  source: AudioNode,
  { connectToOutput }: { connectToOutput: boolean },
): LevelMeter {
  const analyser = ctx.createAnalyser();
  // Small FFT: this is an amplitude envelope for an animation, not spectral
  // analysis. A bigger window costs time and smooths away the transients
  // that make the orb look responsive.
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.6;

  source.connect(analyser);
  // The microphone path must NOT reach the speakers — connecting it would
  // feed the visitor's own voice back at them and, worse, into the mic.
  if (connectToOutput) analyser.connect(ctx.destination);

  const buffer = new Uint8Array(analyser.frequencyBinCount);

  return {
    read() {
      analyser.getByteTimeDomainData(buffer);
      // RMS around the 128 midpoint. Peak amplitude would spike on any click;
      // RMS tracks perceived loudness, which is what should move the orb.
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        const deviation = (buffer[i] - 128) / 128;
        sum += deviation * deviation;
      }
      const rms = Math.sqrt(sum / buffer.length);
      // Speech RMS rarely exceeds ~0.3, so scale it into a usable range
      // rather than leaving the orb barely twitching at full volume.
      return Math.min(1, rms * 3.2);
    },
    dispose() {
      try {
        source.disconnect(analyser);
        analyser.disconnect();
      } catch {
        // Already torn down — nothing to release.
      }
    },
  };
}

/** Meter for a live microphone stream. Never routed to the speakers. */
export function meterFromStream(stream: MediaStream): LevelMeter {
  const ctx = getAudioContext();
  return buildMeter(ctx, ctx.createMediaStreamSource(stream), {
    connectToOutput: false,
  });
}

/**
 * Meter for an <audio> element, routed through to the speakers.
 *
 * `createMediaElementSource` can only be called once per element — a second
 * call throws — so the node is cached on the element itself and reused for
 * every utterance that plays through it.
 */
const elementSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

export function meterFromElement(el: HTMLMediaElement): LevelMeter {
  const ctx = getAudioContext();
  let source = elementSources.get(el);
  if (!source) {
    source = ctx.createMediaElementSource(el);
    elementSources.set(el, source);
  }
  return buildMeter(ctx, source, { connectToOutput: true });
}
