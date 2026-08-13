import "server-only";

/**
 * ElevenLabs text-to-speech.
 *
 * Claude stays the brain — the architect prompt, the guardrails, the live
 * analysis and the summary pipeline are untouched. This only gives the
 * architect a voice worth listening to, because the browser's built-in
 * speech synthesis is not one.
 *
 * The API key never reaches the browser: the client posts text to
 * `/api/speech`, which calls this and streams audio back. That also keeps the
 * site's `connect-src 'self'` CSP intact — a direct browser call to
 * elevenlabs.io would need the policy widened, which is a bad trade for
 * saving one hop.
 */

const API_BASE = "https://api.elevenlabs.io/v1";

/**
 * Rachel — a stock ElevenLabs voice, used so the feature works the moment a
 * key is present. Override with ELEVENLABS_VOICE_ID once a voice is chosen.
 */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/**
 * Flash is the low-latency model. For a conversational turn the wait before
 * the first sound matters more than the last few percent of fidelity — a
 * pause long enough to notice reads as the system being broken.
 */
const DEFAULT_MODEL_ID = "eleven_flash_v2_5";

/**
 * Whether voice output is configured. Everything downstream degrades
 * gracefully when this is false: the architect still replies in text, the
 * orb still animates from the microphone, and nothing throws.
 */
export function hasElevenLabsCredentials(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export function voiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
}

export function voiceModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;
}

export type SpeechFailure = {
  status: number;
  error: string;
  /** Logged, never returned — upstream messages can echo the key back. */
  operatorHint: string;
};

/**
 * Streams synthesized speech. Returns the upstream body directly so audio
 * starts playing before generation finishes, rather than buffering the whole
 * clip server-side and adding its full duration to the delay.
 */
export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal,
): Promise<{ ok: true; body: ReadableStream<Uint8Array> } | { ok: false; failure: SpeechFailure }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: "Voice output is not configured.",
        operatorHint:
          "ELEVENLABS_API_KEY is unset. Add it to the environment to enable spoken replies.",
      },
    };
  }

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE}/text-to-speech/${voiceId()}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: voiceModelId(),
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            // A touch of style keeps a long technical answer from flattening
            // out; higher values start to sound theatrical.
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
        signal,
      },
    );
  } catch (error) {
    return {
      ok: false,
      failure: {
        status: 502,
        error: "Couldn't reach the voice service.",
        operatorHint: `Network failure calling ElevenLabs: ${String(error)}`,
      },
    };
  }

  if (!response.ok || !response.body) {
    // Read the upstream text for the log only. A 401 here means a bad key
    // and a 429 means the character quota is spent; both are operator
    // problems and neither should be described to a visitor.
    const detail = await response.text().catch(() => "");
    return {
      ok: false,
      failure: {
        status: response.status === 429 ? 429 : 502,
        error:
          response.status === 429
            ? "The voice service is rate limited right now."
            : "Voice output is temporarily unavailable.",
        operatorHint: `ElevenLabs responded ${response.status}: ${detail.slice(0, 500)}`,
      },
    };
  }

  return { ok: true, body: response.body };
}
