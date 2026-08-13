import { z } from "zod";

/**
 * Icons the summary generator is allowed to pick. Constraining this to an enum
 * means the UI never receives an icon name it can't render.
 */
export const COMPONENT_ICONS = [
  "globe",
  "mobile-screen",
  "user-tie",
  "gauge",
  "plug",
  "brain",
  "cloud",
  "shield-halved",
  "database",
  "chart-bar",
  "users",
  "file-lines",
  "location-dot",
  "robot",
  "gears",
] as const;

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export const COMPLEXITIES = [
  "Simple",
  "Moderate",
  "Complex",
  "Enterprise",
] as const;

/** Live analysis panel — refreshed after each assistant turn. */
export const AnalysisSchema = z.object({
  title: z
    .string()
    .describe("Three-to-five word title for this session, e.g. 'Trucking TMS Platform'"),
  industry: z.string().describe("Detected industry, or empty string if unclear"),
  scale: z
    .string()
    .describe("Organisation scale in the client's own terms, e.g. '45 Drivers (SMB)'"),
  complexity: z
    .enum(["", ...COMPLEXITIES])
    .describe("Overall build complexity, or empty string if unclear"),
  currentState: z
    .string()
    .describe("How they operate today, e.g. 'Manual / Spreadsheets'"),
  clarityScore: z.number().int().describe("0-100 confidence the project is understood"),
  requirementsFound: z.number().int().describe("Distinct requirements identified so far"),
  requirementsTarget: z
    .number()
    .int()
    .describe("Estimated total requirements for a project this size"),
  recommendedPlatform: z
    .string()
    .describe("Class of system recommended, e.g. 'Transportation Management System'"),
  modules: z.array(z.string()).describe("Confirmed modules"),
  unclearModules: z.array(z.string()).describe("Modules hinted at but not confirmed"),
  clarifications: z.array(z.string()).describe("Open questions blocking architecture"),
  suggestions: z
    .array(z.string())
    .describe("3-5 quick-reply chips in the client's voice, under 6 words each"),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const RequirementSchema = z.object({
  text: z.string().describe("The requirement, specific and testable"),
  priority: z.enum(PRIORITIES),
  category: z.string().describe("Module or category this belongs to"),
});

export type Requirement = z.infer<typeof RequirementSchema>;

/** Full project summary document. */
export const SummarySchema = z.object({
  title: z.string().describe("Platform name, e.g. 'Transportation Management Platform'"),
  description: z
    .string()
    .describe("Two or three sentences for the client's executive team"),
  industry: z.string(),
  complexity: z.enum(COMPLEXITIES),
  nextStep: z.string().describe("The immediate next step, e.g. 'Architecture Discovery'"),
  components: z
    .array(
      z.object({
        icon: z.enum(COMPONENT_ICONS),
        title: z.string(),
        subtitle: z.string().describe("Technologies or capabilities, dot-separated"),
        accent: z
          .enum([
            "blue",
            "green",
            "purple",
            "orange",
            "cyan",
            "pink",
            "sky",
            "red",
            "emerald",
          ])
          .describe("Accent colour for the card"),
        wide: z.boolean().describe("True if this card should span two columns"),
      }),
    )
    .describe("6-9 recommended system components"),
  requirements: z.object({
    functional: z.array(RequirementSchema),
    nonFunctional: z.array(RequirementSchema),
    aiOpportunities: z.array(RequirementSchema),
    clarifications: z.array(RequirementSchema),
  }),
  techStack: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe("Preliminary stack, e.g. { label: 'Frontend', value: 'React · Next.js' }"),
  phases: z
    .array(
      z.object({
        name: z.string().describe("e.g. 'Phase 1'"),
        label: z.string().describe("e.g. 'Discovery'"),
        duration: z.string().describe("Week range estimate, e.g. '~2-3 weeks'"),
        description: z.string(),
      }),
    )
    .describe("Exactly 5 delivery phases"),
  modules: z.array(z.string()).describe("All identified modules"),
});

export type Summary = z.infer<typeof SummarySchema>;
