/**
 * Speech to text through ElevenLabs Scribe.
 *
 * Replaces the browser's Web Speech API, which was the least reliable part of
 * the voice product: it streams audio to the browser vendor's own service, so
 * it raises `network` errors on healthy connections, is missing entirely from
 * several Chromium forks, and is blocked outright by common privacy
 * extensions. None of that was fixable from here.
 *
 * Sending the audio to ElevenLabs — which already synthesizes the replies —
 * puts both halves of the voice loop on one vendor and one key, and leaves
 * Claude doing the thinking exactly as before.
 */

const API_BASE = "https://api.elevenlabs.io/v1";

/**
 * Scribe. Overridable because ElevenLabs revises the model line faster than
 * this file gets deployed: if the API starts rejecting the id, set
 * ELEVENLABS_STT_MODEL_ID to the current one rather than shipping a patch.
 */
const DEFAULT_STT_MODEL_ID = "scribe_v1";

export function sttModelId(): string {
  return process.env.ELEVENLABS_STT_MODEL_ID || DEFAULT_STT_MODEL_ID;
}

export type TranscriptionFailure = {
  status: number;
  error: string;
  /** Logged, never returned — upstream messages can echo the key back. */
  operatorHint: string;
};

export type TranscriptionResult =
  | { ok: true; text: string }
  | { ok: false; failure: TranscriptionFailure };

export async function transcribeSpeech(
  audio: Blob,
  signal?: AbortSignal,
): Promise<TranscriptionResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: "Dictation is not configured.",
        operatorHint:
          "ELEVENLABS_API_KEY is unset. Add it to the environment to enable dictation.",
      },
    };
  }

  const form = new FormData();
  // The filename is required for the multipart part to be treated as a file;
  // the extension is cosmetic, the content type on the Blob is what counts.
  form.append("file", audio, "utterance.webm");
  form.append("model_id", sttModelId());

  // Left unset by default so Scribe detects the language. Pin it only if a
  // deployment knows its visitors speak one language — detection occasionally
  // mistakes a short utterance for the wrong one.
  const language = process.env.ELEVENLABS_STT_LANGUAGE;
  if (language) form.append("language_code", language);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/speech-to-text`, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
      signal,
    });
  } catch (error) {
    return {
      ok: false,
      failure: {
        status: 502,
        error: "Couldn't reach the transcription service.",
        operatorHint: `Network failure calling ElevenLabs STT: ${String(error)}`,
      },
    };
  }

  if (!response.ok) {
    // 401 is a bad key, 402 an exhausted balance, 422 usually a model id the
    // account cannot use. All are operator problems, none should be described
    // to a visitor, and all three are in the log line below.
    const detail = await response.text().catch(() => "");
    return {
      ok: false,
      failure: {
        status: response.status === 429 ? 429 : 502,
        error:
          response.status === 429
            ? "Dictation is rate limited right now."
            : "Dictation is temporarily unavailable.",
        operatorHint: `ElevenLabs STT responded ${response.status} for model ${sttModelId()}: ${detail.slice(0, 500)}`,
      },
    };
  }

  const body: unknown = await response.json().catch(() => null);
  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : null;

  // A silent clip transcribes to an empty string rather than failing. That is
  // a legitimate outcome, so it returns ok with nothing in it and the caller
  // simply keeps listening.
  return { ok: true, text: typeof text === "string" ? text.trim() : "" };
}
