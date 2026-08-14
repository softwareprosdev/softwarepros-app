import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { transcribeSpeech } from "@/lib/ai/transcribe";

/**
 * Transcribes one spoken utterance.
 *
 * Exists as a proxy rather than a direct browser call for the same two reasons
 * as /api/speech: the ElevenLabs key stays server-side, and the site's
 * `connect-src 'self'` CSP stays as it is.
 */

// Scribe on a ~30s clip is quick, but a cold upstream plus a slow upload
// should not be cut off at the platform default.
export const maxDuration = 60;

/**
 * A conversational utterance is seconds long, and Opus is roughly 6KB/s — so
 * anything approaching this is not a sentence. Rejecting it here keeps an
 * oversized upload from being paid for upstream.
 */
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

/** Below this there is no speech in it, only a click or a breath. */
const MIN_AUDIO_BYTES = 1024;

export async function POST(request: Request) {
  // Looser than /api/speech: a conversation produces one of these per
  // utterance, and people speak in short bursts. Still bounded, because each
  // call costs money.
  const limit = rateLimit(clientKey(request, "transcribe"), {
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too much dictation at once. Try again shortly.");
  }

  let audio: FormDataEntryValue | null;
  try {
    audio = (await request.formData()).get("audio");
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!(audio instanceof Blob)) {
    return Response.json({ error: "No audio was sent." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "That recording is too long." }, { status: 413 });
  }
  // Not an error: a clip this small is silence, and the client should just
  // keep listening rather than show a failure.
  if (audio.size < MIN_AUDIO_BYTES) {
    return Response.json({ text: "" });
  }

  const result = await transcribeSpeech(audio, request.signal);

  if (!result.ok) {
    const { status, error, operatorHint } = result.failure;
    console.error(`[transcribe:${status}] ${operatorHint}`);
    return Response.json({ error }, { status });
  }

  return Response.json(
    { text: result.text },
    // Per-visitor speech: never store it in a shared cache.
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
