import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client. The SDK resolves credentials from
 * ANTHROPIC_API_KEY (or an `ant auth login` profile) on its own.
 */
export const anthropic = new Anthropic();

/** Model used for the AI Architect across chat, analysis and summary. */
export const MODEL = "claude-opus-5";

export function hasAnthropicCredentials() {
  return Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  );
}
