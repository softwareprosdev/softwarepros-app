import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL } from "@/lib/ai/client";
import {
  ANALYSIS_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  conversationTranscript,
} from "@/lib/ai/prompts";
import { AnalysisSchema, SummarySchema, type Analysis, type Summary } from "@/lib/ai/schemas";

type Turn = { role: string; content: string };

/**
 * Re-derives the live analysis panel from the whole conversation. Runs after
 * each assistant turn; failures are non-fatal (the panel just keeps its
 * previous values) so a schema hiccup never breaks the chat.
 */
export async function extractAnalysis(turns: Turn[]): Promise<Analysis | null> {
  try {
    const response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      output_config: { format: zodOutputFormat(AnalysisSchema) },
      messages: [
        {
          role: "user",
          content: `Analyse this discovery conversation and report the current state of understanding.\n\n<conversation>\n${conversationTranscript(turns)}\n</conversation>`,
        },
      ],
    });
    return response.parsed_output ?? null;
  } catch (error) {
    console.error("[analysis] extraction failed", error);
    return null;
  }
}

/** Generates the full project summary document from a conversation. */
export async function generateSummary(turns: Turn[]): Promise<Summary> {
  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SUMMARY_SYSTEM_PROMPT,
    output_config: { format: zodOutputFormat(SummarySchema) },
    messages: [
      {
        role: "user",
        content: `Produce the project summary document for this discovery conversation.\n\n<conversation>\n${conversationTranscript(turns)}\n</conversation>`,
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("The AI Architect could not produce a valid summary.");
  }
  return response.parsed_output;
}
