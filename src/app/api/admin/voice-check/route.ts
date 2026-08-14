import { synthesizeSpeech, voiceId, voiceModelId } from "@/lib/ai/voice";
import { sttModelId } from "@/lib/ai/transcribe";

/**
 * Answers "why is the architect silent?" without a redeploy or a log dive.
 *
 * Every failure in the voice path is deliberately vague to the visitor — an
 * upstream body can carry the API key or account details, so it never reaches
 * a browser. That protection also left the operator guessing between an unset
 * key, a rejected key, a spent balance and a voice id the account cannot use.
 * This route is the operator's side of that: behind Basic auth (see proxy.ts,
 * which gates /api/admin), it says which one it is.
 *
 * The key itself is never returned, only whether one is present.
 */

export const dynamic = "force-dynamic";

// Bounded well under any proxy gateway timeout, so this route always answers.
export const maxDuration = 30;

const API_BASE = "https://api.elevenlabs.io/v1";

/**
 * Every upstream call here is bounded. A diagnostic that hangs is worse than
 * no diagnostic: the proxy returns 504 and the operator learns nothing, at
 * exactly the moment something upstream is already misbehaving. "Timed out"
 * is itself an answer.
 */
const UPSTREAM_TIMEOUT_MS = 8000;

function timeout(): AbortSignal {
  return AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
}

function describeThrow(error: unknown): Check {
  const timedOut =
    error instanceof DOMException && error.name === "TimeoutError";
  return {
    ok: false,
    status: null,
    detail: timedOut
      ? `No response from ElevenLabs within ${UPSTREAM_TIMEOUT_MS}ms.`
      : String(error).slice(0, 300),
  };
}

type Check = {
  ok: boolean;
  status: number | null;
  detail: string;
};

/** Remaining quota, which is the usual answer when audio stops arriving. */
async function checkSubscription(apiKey: string): Promise<Check> {
  try {
    const res = await fetch(`${API_BASE}/user/subscription`, {
      headers: { "xi-api-key": apiKey },
      signal: timeout(),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      return { ok: false, status: res.status, detail: body.slice(0, 300) };
    }

    const parsed: unknown = JSON.parse(body);
    const used =
      typeof parsed === "object" && parsed !== null && "character_count" in parsed
        ? Number((parsed as { character_count: unknown }).character_count)
        : NaN;
    const limit =
      typeof parsed === "object" && parsed !== null && "character_limit" in parsed
        ? Number((parsed as { character_limit: unknown }).character_limit)
        : NaN;

    return {
      ok: true,
      status: res.status,
      detail: Number.isFinite(used) && Number.isFinite(limit)
        ? `${used}/${limit} characters used — ${Math.max(0, limit - used)} left`
        : "Subscription readable, but the character counts were not in the response.",
    };
  } catch (error) {
    return describeThrow(error);
  }
}

/** Does the configured voice actually exist on this account? */
async function checkVoice(apiKey: string): Promise<Check> {
  try {
    const res = await fetch(`${API_BASE}/voices/${voiceId()}`, {
      headers: { "xi-api-key": apiKey },
      signal: timeout(),
    });
    const body = await res.text().catch(() => "");
    return {
      ok: res.ok,
      status: res.status,
      detail: res.ok
        ? `Voice ${voiceId()} is available on this account.`
        : body.slice(0, 300),
    };
  } catch (error) {
    return describeThrow(error);
  }
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        key: "missing",
        verdict:
          "ELEVENLABS_API_KEY is not set in this container. Spoken replies are off; text still works.",
      },
      { status: 200 },
    );
  }

  const [subscription, voice] = await Promise.all([
    checkSubscription(apiKey),
    checkVoice(apiKey),
  ]);

  // The real thing, end to end: if this succeeds, the browser is the only
  // remaining suspect. Deliberately tiny — this costs characters to run.
  const spoken = await synthesizeSpeech("Voice check.", timeout());
  const synthesis: Check = spoken.ok
    ? { ok: true, status: 200, detail: "Synthesis returned audio." }
    : {
        ok: false,
        status: spoken.failure.status,
        detail: spoken.failure.operatorHint.slice(0, 300),
      };

  // Drain the body so a successful check does not leave a stream open.
  if (spoken.ok) await spoken.body.cancel().catch(() => {});

  const verdict = synthesis.ok
    ? "Server-side voice is working. If the site is still silent, the failure is in the browser — check the amber notice on the page and the console."
    : !voice.ok
      ? `ELEVENLABS_VOICE_ID (${voiceId()}) is not usable on this account. Pick a voice from the ElevenLabs dashboard and set it.`
      : !subscription.ok
        ? "The API key was rejected. Check it is the whole key and belongs to this account."
        : "Synthesis failed. The detail below is ElevenLabs' own response.";

  return Response.json({
    key: "set",
    config: {
      voiceId: voiceId(),
      ttsModelId: voiceModelId(),
      sttModelId: sttModelId(),
    },
    subscription,
    voice,
    synthesis,
    verdict,
  });
}
