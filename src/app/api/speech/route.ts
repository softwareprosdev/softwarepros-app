import { z } from "zod";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { synthesizeSpeech } from "@/lib/ai/voice";

/**
 * Text to speech for the AI Architect's replies.
 *
 * Exists as a proxy rather than a direct browser call for two reasons: the
 * ElevenLabs key stays server-side, and the site's `connect-src 'self'` CSP
 * stays as it is.
 */

// ElevenLabs bills per character, so the cap is a spend control as much as a
// validation rule — an unbounded field here is an unbounded invoice. Long
// architect replies are truncated client-side before they reach this.
const Body = z.object({
  text: z.string().trim().min(1).max(2500),
});

export async function POST(request: Request) {
  // Tighter than the chat limit: each call costs real money and a turn only
  // needs one. A burst means something is looping, not a person talking.
  const limit = rateLimit(clientKey(request, "speech"), {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many voice requests. Try again shortly.");
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await synthesizeSpeech(parsed.data.text, request.signal);

  if (!result.ok) {
    const { status, error, operatorHint } = result.failure;
    console.error(`[speech:${status}] ${operatorHint}`);
    // The visitor gets the generic line; the upstream body stays in the log
    // because it can contain the key or account details.
    return Response.json({ error }, { status });
  }

  return new Response(result.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      // Per-visitor conversational audio: never store it in a shared cache.
      "Cache-Control": "private, no-store",
    },
  });
}
