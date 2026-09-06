import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

/**
 * Shared Gemini client (Gemini Developer API, not Vertex AI — no GCP project
 * needed). The SDK falls back to GEMINI_API_KEY/GOOGLE_API_KEY from the
 * environment on its own; passed explicitly here to keep the credential this
 * module actually depends on visible in one place. Constructing this with no
 * key does not throw — it only logs a warning — so `hasGeminiCredentials()`
 * below is what actually gates requests before one is attempted.
 */
export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** Model used for the AI Architect across chat, analysis and summary. */
export const MODEL = "gemini-2.5-flash";

/**
 * Model used only for the internal cost-estimate draft (lib/ai/estimate.ts).
 * Deliberately the cheapest tier, not `MODEL` — this call runs once per
 * contract request rather than once per chat turn, its output is a draft an
 * architect reviews before a client ever sees it, and it is rate-limited
 * separately (see rateLimit("estimate", ...) in api/contracts/route.ts) so a
 * burst of requests can't run up spend on its own.
 */
export const ESTIMATE_MODEL = "gemini-2.5-flash-lite";

export function hasGeminiCredentials() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

/**
 * Adapts a Zod schema for Gemini's `responseJsonSchema` config field, which
 * accepts standard JSON Schema — unlike the older `responseSchema` field,
 * which wants a restricted OpenAPI-3.0 subset and doesn't understand `$ref`.
 * Strips `$schema`; Gemini doesn't read it and it isn't in its documented
 * list of recognised keywords.
 */
export function geminiJsonSchema(schema: z.ZodType): unknown {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  delete jsonSchema.$schema;
  return jsonSchema;
}
