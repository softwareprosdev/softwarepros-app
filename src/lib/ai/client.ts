import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client. The SDK resolves credentials from
 * ANTHROPIC_API_KEY (or an `ant auth login` profile) on its own.
 */
export const anthropic = new Anthropic();

/** Model used for the AI Architect across chat, analysis and summary. */
export const MODEL = "claude-opus-5";

/**
 * Model used only for the internal cost-estimate draft (lib/ai/estimate.ts).
 * Deliberately the cheapest tier, not `MODEL` — this call runs once per
 * contract request rather than once per chat turn, its output is a draft an
 * architect reviews before a client ever sees it, and it is rate-limited
 * separately (see rateLimit("estimate", ...) in api/contracts/route.ts) so a
 * burst of requests can't run up spend on its own.
 */
export const ESTIMATE_MODEL = "claude-haiku-5";

export function hasAnthropicCredentials() {
  return Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  );
}
