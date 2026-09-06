import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client. The SDK resolves credentials from
 * ANTHROPIC_API_KEY (or an `ant auth login` profile) on its own.
 */
export const anthropic = new Anthropic();

/**
 * Model used for the AI Architect across chat, analysis, summary, and the
 * internal cost-estimate draft. Haiku, not Opus — chosen for cost, since this
 * runs on every chat turn and the budget for this feature favors a cheap,
 * fast model over the strongest one.
 */
export const MODEL = "claude-haiku-5";

export function hasAnthropicCredentials() {
  return Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  );
}
