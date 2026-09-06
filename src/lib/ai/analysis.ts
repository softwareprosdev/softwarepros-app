import "server-only";
import { gemini, MODEL, geminiJsonSchema } from "@/lib/ai/client";
import {
  ANALYSIS_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  conversationTranscript,
} from "@/lib/ai/prompts";
import { AnalysisSchema, SummarySchema, type Analysis, type Summary } from "@/lib/ai/schemas";

type Turn = { role: string; content: string };

const ANALYSIS_JSON_SCHEMA = geminiJsonSchema(AnalysisSchema);
const SUMMARY_JSON_SCHEMA = geminiJsonSchema(SummarySchema);

/**
 * Re-derives the live analysis panel from the whole conversation. Runs after
 * each assistant turn; failures are non-fatal (the panel just keeps its
 * previous values) so a schema hiccup never breaks the chat.
 */
export async function extractAnalysis(turns: Turn[]): Promise<Analysis | null> {
  try {
    const response = await gemini.models.generateContent({
      model: MODEL,
      contents: `Analyse this discovery conversation and report the current state of understanding.\n\n<conversation>\n${conversationTranscript(turns)}\n</conversation>`,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseJsonSchema: ANALYSIS_JSON_SCHEMA,
      },
    });
    if (!response.text) return null;
    return AnalysisSchema.parse(JSON.parse(response.text));
  } catch (error) {
    console.error("[analysis] extraction failed", error);
    return null;
  }
}

/** Generates the full project summary document from a conversation. */
export async function generateSummary(turns: Turn[]): Promise<Summary> {
  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: `Produce the project summary document for this discovery conversation.\n\n<conversation>\n${conversationTranscript(turns)}\n</conversation>`,
    config: {
      systemInstruction: SUMMARY_SYSTEM_PROMPT,
      maxOutputTokens: 16000,
      responseMimeType: "application/json",
      responseJsonSchema: SUMMARY_JSON_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error("The AI Architect could not produce a valid summary.");
  }
  return SummarySchema.parse(JSON.parse(response.text));
}
