import Anthropic from "@anthropic-ai/sdk";

/**
 * Model the AI Architect runs on across chat, analysis, summary, and the
 * internal cost-estimate draft. Haiku, not Opus — chosen for cost, since this
 * runs on every chat turn and the budget for this feature favors a cheap,
 * fast model over the strongest one.
 */
const ANTHROPIC_MODEL = "claude-haiku-4-5";

/**
 * Requesty (https://requesty.ai) is an Anthropic-compatible gateway: same
 * Messages API and the same SDK, reached with a Requesty key instead of an
 * Anthropic one. Global endpoint; `REQUESTY_BASE_URL` overrides it (their EU
 * residency endpoint is https://router.eu.requesty.ai).
 */
const REQUESTY_BASE_URL = "https://router.requesty.ai";

/**
 * Requesty addresses models as `provider/model`, not by the bare Anthropic id,
 * so the id has to change with the route — passing the bare id to the
 * gateway is a 404 on a model that plainly exists.
 */
const REQUESTY_MODEL_PREFIX = "anthropic/";

function requestyKey() {
  return process.env.REQUESTY_API_KEY?.trim() || "";
}

/**
 * Which provider this process talks to. Requesty is opt-in per environment:
 * with `REQUESTY_API_KEY` set every AI Architect call routes through the
 * gateway, and without it nothing changes — the SDK resolves an Anthropic key
 * from ANTHROPIC_API_KEY (or an `ant auth login` profile) exactly as before.
 */
export const usingRequesty = Boolean(requestyKey());

/**
 * Shared client. One `Anthropic` either way: the gateway speaks the Messages
 * API, so only the credential and the base URL move.
 */
export const anthropic = usingRequesty
  ? new Anthropic({
      apiKey: requestyKey(),
      baseURL: process.env.REQUESTY_BASE_URL?.trim() || REQUESTY_BASE_URL,
    })
  : new Anthropic();

/**
 * The model id to send. `REQUESTY_MODEL` pins an exact gateway id without a
 * code change — Requesty's catalogue moves independently of Anthropic's, so
 * an operator needs to be able to re-point this the day an id changes.
 */
export const MODEL = usingRequesty
  ? process.env.REQUESTY_MODEL?.trim() || `${REQUESTY_MODEL_PREFIX}${ANTHROPIC_MODEL}`
  : ANTHROPIC_MODEL;

/** Whether a key for either route is configured. */
export function hasAiCredentials() {
  return Boolean(
    requestyKey() ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN,
  );
}
