import "server-only";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, ESTIMATE_MODEL } from "@/lib/ai/client";
import { EstimateSchema, type Estimate, type Summary } from "@/lib/ai/schemas";

/**
 * Internal system prompt for the cost-estimate draft — separate from
 * `ARCHITECT_SYSTEM_PROMPT` / `SUMMARY_SYSTEM_PROMPT` in prompts.ts, which
 * deliberately forbid the client-facing AI from ever stating a price. This
 * prompt is the one place that rule is intentionally different, because its
 * output is never shown to a client directly — an architect reviews and
 * adjusts it first. Keep those two rules apart: loosening the client-facing
 * prompts to "let the AI just quote a price" was exactly the failure mode
 * this whole review step exists to prevent.
 */
const ESTIMATE_SYSTEM_PROMPT = `You draft an internal, non-binding cost estimate for a software project, from a structured project summary a different AI already produced. A human Senior Software Architect reviews and can adjust this number before it is ever shown to a client or attached to a contract — you are drafting a starting point for that review, not a quote.

Base the range on: the complexity rating, the number and priority mix of functional/non-functional requirements, the recommended technology stack, the phase count, and any AI/automation components (these usually add integration and evaluation cost, not just build cost).

Rules:
- Widen the range (lowCents to highCents) when the summary itself signals unresolved unknowns — open clarifications, vague requirements, unclear integrations. A well-specified "Moderate" project should have a tighter range than a vague "Complex" one.
- Reason in whole US dollars for a small custom-software engineering firm's rates, then convert to cents. Do not anchor on round marketing numbers ("$50,000") for their own sake — reason from the actual scope.
- "notes" is for the architect only: name the two or three factors that most drove this number, and anything you were genuinely unsure about. Never write client-facing language here.
- If the summary is too thin to estimate responsibly (e.g. almost no requirements, complexity unclear), say so plainly in "notes" and return a wide range rather than a falsely precise one.`;

/** Drafts a cost-estimate range from an already-generated project summary. */
export async function estimateProjectCost(summary: Summary): Promise<Estimate> {
  const response = await anthropic.messages.parse({
    model: ESTIMATE_MODEL,
    max_tokens: 1024,
    system: ESTIMATE_SYSTEM_PROMPT,
    output_config: { format: zodOutputFormat(EstimateSchema) },
    messages: [
      {
        role: "user",
        content: `Draft a cost estimate for this project summary.\n\n<summary>\n${JSON.stringify(summary, null, 2)}\n</summary>`,
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("The estimate draft could not be generated.");
  }
  return response.parsed_output;
}
