import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { Wordmark } from "@/components/SiteNav";
import { SummaryActions } from "@/components/summary/SummaryActions";
import { LeadForm } from "@/components/summary/LeadForm";
import { BuildContractButton } from "@/components/summary/BuildContractButton";
import { getCurrentUser } from "@/lib/session-user";
import { COMPONENT_ICONS, PRIORITIES } from "@/lib/ai/schemas";
import type { Requirement, Summary } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

/* ── Narrow shapes, derived from the generator's zod schemas ───────── */

type SummaryComponent = Summary["components"][number];
type ComponentIcon = SummaryComponent["icon"];
type Accent = SummaryComponent["accent"];
type TechEntry = Summary["techStack"][number];
type Phase = Summary["phases"][number];
type RequirementGroups = Summary["requirements"];
type RequirementGroupKey = keyof RequirementGroups;

/* ── Prisma Json columns are `JsonValue`; validate before rendering ── */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isComponentIcon(value: unknown): value is ComponentIcon {
  return (
    typeof value === "string" &&
    (COMPONENT_ICONS as readonly string[]).includes(value)
  );
}

function isAccent(value: unknown): value is Accent {
  return typeof value === "string" && value in ACCENT_ICON;
}

function isPriority(value: unknown): value is Requirement["priority"] {
  return (
    typeof value === "string" && (PRIORITIES as readonly string[]).includes(value)
  );
}

function toComponents(value: unknown): SummaryComponent[] {
  return toArray(value).flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const title = str(raw.title);
    if (!title) return [];
    return [
      {
        icon: isComponentIcon(raw.icon) ? raw.icon : "gears",
        title,
        subtitle: str(raw.subtitle),
        accent: isAccent(raw.accent) ? raw.accent : "blue",
        wide: raw.wide === true,
      },
    ];
  });
}

function toRequirements(value: unknown): Requirement[] {
  return toArray(value).flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const text = str(raw.text);
    if (!text) return [];
    return [
      {
        text,
        priority: isPriority(raw.priority) ? raw.priority : "Medium",
        category: str(raw.category, "General"),
      },
    ];
  });
}

function toRequirementGroups(value: unknown): RequirementGroups {
  const record = isRecord(value) ? value : {};
  return {
    functional: toRequirements(record.functional),
    nonFunctional: toRequirements(record.nonFunctional),
    aiOpportunities: toRequirements(record.aiOpportunities),
    clarifications: toRequirements(record.clarifications),
  };
}

function toTechStack(value: unknown): TechEntry[] {
  return toArray(value).flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const label = str(raw.label);
    const entryValue = str(raw.value);
    if (!label && !entryValue) return [];
    return [{ label, value: entryValue }];
  });
}

function toPhases(value: unknown): Phase[] {
  return toArray(value).flatMap((raw, index) => {
    if (!isRecord(raw)) return [];
    const label = str(raw.label);
    if (!label) return [];
    return [
      {
        name: str(raw.name, `Phase ${index + 1}`),
        label,
        duration: str(raw.duration),
        description: str(raw.description),
      },
    ];
  });
}

function toModules(value: unknown): string[] {
  return toArray(value).filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

/* ── Static style maps (Tailwind can only see literal class strings) ─ */

const ACCENT_ICON: Record<Accent, string> = {
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
  orange: "text-orange-400",
  cyan: "text-cyan-400",
  pink: "text-pink-400",
  sky: "text-sky-400",
  red: "text-red-400",
  emerald: "text-emerald-400",
};

const ACCENT_BORDER: Record<Accent, string> = {
  blue: "hover:border-blue-500/20",
  green: "hover:border-green-500/20",
  purple: "hover:border-purple-500/20",
  orange: "hover:border-orange-500/20",
  cyan: "hover:border-cyan-500/20",
  pink: "hover:border-pink-500/20",
  sky: "hover:border-sky-500/20",
  red: "hover:border-red-500/20",
  emerald: "hover:border-emerald-500/20",
};

const COMPLEXITY_PILL: Record<string, string> = {
  Simple: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  Moderate: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  Complex: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  Enterprise: "bg-orange-500/15 border-orange-500/30 text-orange-300",
};

const REQUIREMENT_GROUPS: {
  key: RequirementGroupKey;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    key: "functional",
    label: "Functional Requirements",
    icon: "circle-check",
    color: "text-green-400",
  },
  {
    key: "nonFunctional",
    label: "Non-Functional Requirements",
    icon: "circle-check",
    color: "text-blue-400",
  },
  {
    key: "aiOpportunities",
    label: "AI & Automation Opportunities",
    icon: "sparkles",
    color: "text-yellow-400",
  },
  {
    key: "clarifications",
    label: "Needs Clarification",
    icon: "triangle-exclamation",
    color: "text-amber-400",
  },
];

// Phase bars taper as the estimate gets less certain; the gradient walks
// blue → indigo → purple → pink → orange across the five phases.
const PHASE_WIDTHS = ["100%", "80%", "75%", "50%", "25%"];
const PHASE_GRADIENTS = [
  "linear-gradient(to right, #2563eb, #4f46e5)",
  "linear-gradient(to right, #4f46e5, #7c3aed)",
  "linear-gradient(to right, #7c3aed, #db2777)",
  "linear-gradient(to right, #db2777, #f97316)",
  "linear-gradient(to right, #f97316, #eab308)",
];
const PHASE_NAME_COLORS = [
  "text-blue-400",
  "text-indigo-400",
  "text-purple-400",
  "text-pink-400",
  "text-orange-400",
];

const MODULE_PILLS = [
  "bg-blue-950/40 border-blue-500/20 text-blue-200",
  "bg-green-950/40 border-green-500/20 text-green-200",
  "bg-purple-950/40 border-purple-500/20 text-purple-200",
  "bg-orange-950/40 border-orange-500/20 text-orange-200",
  "bg-pink-950/40 border-pink-500/20 text-pink-200",
  "bg-cyan-950/40 border-cyan-500/20 text-cyan-200",
  "bg-violet-950/40 border-violet-500/20 text-violet-200",
  "bg-teal-950/40 border-teal-500/20 text-teal-200",
  "bg-yellow-950/40 border-yellow-500/20 text-yellow-200",
  "bg-red-950/40 border-red-500/20 text-red-200",
];

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

function formatGenerated(date: Date): string {
  return `${DATE_FORMAT.format(date)} · ${TIME_FORMAT.format(date)} UTC`;
}

function industryIcon(industry: string): string {
  return /transport|logistic|truck|fleet|freight|shipping/i.test(industry)
    ? "truck"
    : "globe";
}

/* ── Page ──────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: PageProps<"/summary/[id]">): Promise<Metadata> {
  const { id } = await params;
  const summary = await prisma.projectSummary.findUnique({
    where: { publicId: id },
    select: { title: true, description: true },
  });
  if (!summary) return { title: "Summary Not Found" };
  return {
    title: summary.title,
    description: summary.description.slice(0, 200),
    // Summaries are per-client documents, not public marketing pages.
    robots: { index: false, follow: false },
  };
}

export default async function ProjectSummaryPage({
  params,
}: PageProps<"/summary/[id]">) {
  const { id } = await params;

  const summary = await prisma.projectSummary.findUnique({
    where: { publicId: id },
    include: { session: true },
  });

  if (!summary) notFound();

  // Summaries stay shareable-by-link (see the metadata note above), but
  // building a contract from one is not — only the client who owns the
  // underlying session can start pricing on it.
  const user = await getCurrentUser();
  const isOwner = user?.id === summary.session.userId;

  const components = toComponents(summary.components);
  const requirements = toRequirementGroups(summary.requirements);
  const techStack = toTechStack(summary.techStack);
  const phases = toPhases(summary.phases);
  const modules = toModules(summary.modules);

  const discoveryHref = `/discovery/${summary.session.publicId}`;
  const scheduleHref = `/contact?intent=schedule&summary=${summary.publicId}`;
  const complexityPill =
    COMPLEXITY_PILL[summary.complexity] ??
    "bg-white/10 border-white/20 text-gray-200";
  const phaseCount = phases.length || summary.phaseCount;

  return (
    <>
      <a href="#summary-main" className="skip-link">
        Skip to project summary
      </a>

      <nav
        aria-label="Project summary"
        className="sticky top-0 w-full z-50 px-6 py-4 flex justify-between items-center gap-4 bg-ink/90 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="h-4 w-px bg-white/10" aria-hidden="true" />
          <span className="text-sm text-gray-400">AI Project Summary</span>
        </div>
        <div className="no-print flex items-center gap-3">
          <SummaryActions />
          <Link
            href="/contact?intent=schedule"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Start My Project
          </Link>
        </div>
      </nav>

      <div className="no-print bg-amber-950/40 border-b border-amber-500/20 px-6 py-3 flex items-start gap-3">
        <Icon name="circle-info" className="text-amber-400 text-sm mt-0.5" />
        <p className="text-xs text-amber-300">
          <strong>AI-Generated Recommendation</strong> — This summary was
          generated by the SoftwarePros AI Architect based on your conversation.
          All requirements are estimates and require review by a Senior Software
          Architect before they become commitments.
        </p>
      </div>

      <main id="summary-main" className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="ai-badge">AI-Generated · Estimated</span>
                <span className="text-xs text-gray-500 font-mono">
                  Generated: {formatGenerated(summary.createdAt)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {summary.title}
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl">
                {summary.description}
              </p>
            </div>

            <div className="glass rounded-2xl p-6 min-w-56">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Industry
                  </dt>
                  <dd className="font-semibold flex items-center gap-2">
                    <Icon
                      name={industryIcon(summary.industry)}
                      className="text-amber-400 text-sm"
                    />
                    {summary.industry || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Complexity
                  </dt>
                  <dd>
                    <span
                      className={`inline-block px-3 py-1 border rounded-full text-xs font-semibold ${complexityPill}`}
                    >
                      {summary.complexity || "To be assessed"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Phases
                  </dt>
                  <dd className="font-semibold">{phaseCount} Phases</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Next Step
                  </dt>
                  <dd className="text-sm text-blue-400 font-medium">
                    {summary.nextStep}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* MAIN COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {components.length > 0 && (
              <section className="glass rounded-2xl p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Icon name="cubes" className="text-blue-400" /> Recommended
                  System Components
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {components.map((component, index) => (
                    <div
                      key={`${index}-${component.title}`}
                      className={`bg-ink/50 border border-white/5 rounded-xl p-5 transition-colors ${
                        ACCENT_BORDER[component.accent]
                      } ${component.wide ? "col-span-2" : ""}`}
                    >
                      <Icon
                        name={component.icon}
                        className={`${ACCENT_ICON[component.accent]} text-xl mb-3 block`}
                      />
                      <p className="font-semibold text-sm mb-1">
                        {component.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {component.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="glass rounded-2xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Icon name="list-check" className="text-green-400" />{" "}
                  AI-Generated Requirements
                </h2>
                <span className="ai-badge">Requires Engineering Review</span>
              </div>

              {REQUIREMENT_GROUPS.map((group) => {
                const items = requirements[group.key];
                if (items.length === 0) return null;
                return (
                  <section key={group.key}>
                    <h3 className="req-category">{group.label}</h3>
                    {items.map((requirement, index) => (
                      <div
                        key={`${group.key}-${index}-${requirement.text}`}
                        className="req-item"
                      >
                        <Icon
                          name={group.icon}
                          className={`${group.color} text-xs mt-0.5 w-3 shrink-0`}
                        />
                        <div>
                          <p className="text-sm text-gray-200">
                            {requirement.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Priority: {requirement.priority} · Module:{" "}
                            {requirement.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </section>
                );
              })}
            </section>

            {techStack.length > 0 && (
              <section className="glass rounded-2xl p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Icon name="microchip" className="text-violet-400" />{" "}
                  Preliminary Technology Stack
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {techStack.map((entry, index) => (
                    <div
                      key={`${index}-${entry.label}`}
                      className="bg-ink/50 rounded-lg p-3 border border-white/5 text-xs"
                    >
                      <span className="text-gray-500 block mb-1">
                        {entry.label}
                      </span>
                      <span className="font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  * Technology selections are preliminary estimates subject to
                  architecture review
                </p>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {phases.length > 0 && (
              <section className="glass rounded-2xl p-6">
                <h2 className="font-bold mb-5 flex items-center gap-2">
                  <Icon name="timeline" className="text-blue-400 text-sm" />{" "}
                  Recommended Phases
                </h2>
                <ol className="space-y-4">
                  {phases.map((phase, index) => (
                    <li key={`${index}-${phase.label}`}>
                      <div className="flex justify-between gap-3 mb-1.5">
                        <div>
                          <span
                            className={`text-xs font-bold ${
                              PHASE_NAME_COLORS[index % PHASE_NAME_COLORS.length]
                            }`}
                          >
                            {phase.name}
                          </span>
                          <span className="text-sm font-semibold ml-2">
                            {phase.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {phase.duration}
                        </span>
                      </div>
                      <div
                        className="phase-bar mb-1"
                        style={{
                          width: PHASE_WIDTHS[index % PHASE_WIDTHS.length],
                          background:
                            PHASE_GRADIENTS[index % PHASE_GRADIENTS.length],
                        }}
                        aria-hidden="true"
                      />
                      <p className="text-xs text-gray-500">
                        {phase.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {modules.length > 0 && (
              <section className="glass rounded-2xl p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-sm">
                  <Icon name="puzzle-piece" className="text-cyan-400 text-sm" />{" "}
                  All Identified Modules
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {modules.map((module, index) => (
                    <li
                      key={`${index}-${module}`}
                      className={`text-xs border px-2.5 py-1 rounded-lg ${
                        MODULE_PILLS[index % MODULE_PILLS.length]
                      }`}
                    >
                      {module}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-gradient-to-br from-blue-900/60 to-indigo-900/50 border border-blue-500/25 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                Next Step
              </p>
              <h2 className="text-lg font-bold mb-2">
                Speak With A Software Architect
              </h2>
              <p className="text-sm text-gray-300 mb-5">
                A SoftwarePros senior engineer will review your AI-generated
                requirements, ask clarifying questions, and build a real
                architecture proposal.
              </p>
              <Link
                href={scheduleHref}
                className="block w-full text-center py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold mb-3 hover:opacity-90 transition-opacity"
              >
                <Icon name="calendar" className="mr-2" /> Schedule Architecture
                Call
              </Link>
              <Link
                href={discoveryHref}
                className="block w-full text-center py-3 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
              >
                Continue Refining with AI
              </Link>
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-gray-400 text-center">
                  No obligation · Discovery call is free
                  <br />
                  This is not a quote or contract
                </p>
              </div>
            </section>

            {isOwner && <BuildContractButton summaryId={summary.publicId} />}

            <LeadForm summaryId={summary.publicId} />
          </div>
        </div>
      </main>

      <Link
        href={discoveryHref}
        className="no-print fixed bottom-8 right-8 z-40 px-6 py-3 bg-blue-600 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
      >
        <span
          className="w-2 h-2 bg-white rounded-full animate-pulse"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold">Continue Discovery</span>
      </Link>
    </>
  );
}
