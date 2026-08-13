import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { FaqSection } from "@/components/seo/FaqSection";
import { pageSchema } from "@/lib/schema";
import { ABOUT_FAQS } from "@/lib/faq";
import {
  INDUSTRIES,
  PIPELINE,
  SERVICES,
  TECHNOLOGIES,
  TRUST_STATS,
} from "@/lib/content";
import { ORG_DESCRIPTION, ORG_DISCIPLINES, ORG_NAME } from "@/lib/org";

export const metadata: Metadata = {
  title: "About",
  description:
    "How SoftwarePros works: discovery before code, security as a design constraint, domain fluency across 15 industries, and an eight-stage delivery pipeline.",
  alternates: { canonical: "/about" },
};

/**
 * How the firm works, one card per operating principle. Each links to the page
 * that is the evidence for it, so the claim and the proof are one click apart.
 */
const PRINCIPLES: {
  href: string;
  icon: string;
  title: string;
  body: string;
  color: string;
  accent: string;
  accentRgb: string;
}[] = [
  {
    href: "/discovery",
    icon: "magnifying-glass",
    title: "Discovery before code",
    body: "Every engagement opens with a conversation that turns a business problem into a system definition — scope, components, stack, phasing. Writing code before that is guessing with someone else's budget.",
    color: "text-sky-400",
    accent: "#0ea5e9",
    accentRgb: "14,165,233",
  },
  {
    href: "/solutions/cybersecurity",
    icon: "shield-halved",
    title: "Security is a design constraint",
    body: "Threat modelling happens during architecture, not after launch. Authentication model, data boundaries, blast radius, audit trail — decided while they are still cheap to change rather than found in an audit.",
    color: "text-red-400",
    accent: "#ef4444",
    accentRgb: "239,68,68",
  },
  {
    href: "/industries",
    icon: "industry",
    title: "Domain fluency, not a glossary",
    body: `We come into a ${INDUSTRIES.length}-industry range already knowing what HL7 means in healthcare and what an EDI 214 carries in logistics. Software that misreads the domain gets worked around, not used.`,
    color: "text-emerald-400",
    accent: "#10b981",
    accentRgb: "16,185,129",
  },
  {
    href: "/solutions",
    icon: "cubes",
    title: "One practice, not service lines",
    body: `All ${SERVICES.length} disciplines sit in the same team because they depend on each other. An AI feature is only as sound as the data platform and the security model underneath it.`,
    color: "text-blue-400",
    accent: "#3b82f6",
    accentRgb: "59,130,246",
  },
  {
    href: "/contact",
    icon: "user-tie",
    title: "Engineers own systems end to end",
    body: "The engineer who designs a system builds it, secures it, deploys it, and watches it run. No handoff to a delivery team, and no account manager between you and the person making the decisions.",
    color: "text-purple-400",
    accent: "#a855f7",
    accentRgb: "168,85,247",
  },
  {
    href: "/contact?intent=schedule",
    icon: "file-invoice-dollar",
    title: "No price before the scope exists",
    body: "A quote given before the system is defined prices a guess. We define the integrations, the compliance regime, and the edge cases the manual process hides — then the number describes real work.",
    color: "text-amber-400",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
  },
];

/** Icons for the four practice areas, in the order `org.ts` lists them. */
const DISCIPLINE_ICONS: Record<string, string> = {
  "Artificial Intelligence": "brain",
  "Software Engineering": "code",
  Cybersecurity: "shield-halved",
  "Cloud Infrastructure": "cloud",
};

/** What we deliberately do not do — each one is a decision, not an omission. */
const REFUSALS = [
  {
    title: "We don't sell software packages",
    body: "There is no product to fit you into. Systems are engineered around your business logic, which is the only reason custom software is ever worth more than a licence.",
  },
  {
    title: "We don't quote before scope is defined",
    body: "An estimate is a description of work. Until discovery has established what the software has to do, there is no work to describe — only a number that will move.",
  },
  {
    title: "We don't treat security as a final gate",
    body: "A vulnerability found during design costs a conversation. The same vulnerability found in production costs an incident. So security is a stage of the pipeline, not a sign-off at the end of it.",
  },
];

export default function AboutPage() {
  const schema = pageSchema({
    path: "/about",
    name: `About ${ORG_NAME}`,
    description:
      "How SoftwarePros works — discovery before code, security as a design constraint, domain fluency across 15 industries, and engineers who own systems end to end.",
    breadcrumbs: [{ name: "About", path: "/about" }],
    faqs: ABOUT_FAQS,
  });

  return (
    <>
      <JsonLd data={schema} />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-4 block">
                How We Work
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
                We Define It
                <br />
                Before We Build It
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                {ORG_DESCRIPTION} What that looks like in practice is narrower
                than a mission statement: discovery before a line of code,
                security decided in architecture, and one engineer accountable
                for a system from definition through production.
              </p>

              <AnswerBlock
                question="How does SoftwarePros work?"
                className="mt-10"
              >
                SoftwarePros defines a system before building it. Discovery
                turns a business problem into scope, components, stack, and
                phasing; architecture settles the security model while it is
                still cheap to change; and the same engineers carry the work
                through build, deploy, and production. No price is quoted before
                the scope exists, because a quote given earlier prices a guess.
              </AnswerBlock>
            </div>

            <dl className="flex flex-wrap gap-12 mt-14 pt-10 border-t border-white/5">
              {TRUST_STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-3xl font-bold mb-1">{stat.value}</dd>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-600 mt-8">
              * Combined figures across the {ORG_NAME} engineering team.
            </p>
          </div>
        </section>

        {/* ── Operating principles ───────────────────────────────── */}
        <section aria-labelledby="principles" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-sky-500/50 to-transparent" />
              <h2
                id="principles"
                className="text-xs font-bold tracking-widest uppercase text-primary"
              >
                Six Things That Decide Everything Else
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-sky-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRINCIPLES.map((principle) => (
                <Link
                  key={principle.title}
                  href={principle.href}
                  className="service-card group rounded-2xl p-7"
                  style={
                    {
                      "--accent": principle.accent,
                      "--accent-rgb": principle.accentRgb,
                    } as React.CSSProperties
                  }
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(var(--accent-rgb),0.1)",
                        borderColor: "rgba(var(--accent-rgb),0.22)",
                      }}
                    >
                      <Icon name={principle.icon} className={principle.color} />
                    </div>
                    <Icon
                      name="arrow-up-right"
                      className="text-gray-600 text-xs service-arrow shrink-0"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{principle.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {principle.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── The pipeline ───────────────────────────────────────── */}
        <section aria-labelledby="pipeline" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card rounded-3xl p-10 md:p-12">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 block">
                {PIPELINE.length}-Stage Delivery
              </span>
              <h2
                id="pipeline"
                className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
              >
                Every system takes the same route to production.
              </h2>
              <p className="text-gray-400 max-w-2xl leading-relaxed mb-10">
                The domain changes what gets built. It does not change how it
                gets built. A hospice charting app and a freight settlement
                system share almost no vocabulary, and both still pass through
                these {PIPELINE.length} stages — including the ones after
                launch, which is where most software quietly stops being
                maintained.
              </p>
              <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {PIPELINE.map((stage) => (
                  <li
                    key={stage.step}
                    className="bg-card border border-white/5 rounded-xl p-5"
                  >
                    <span className="text-xs font-bold text-primary">
                      {stage.step}
                    </span>
                    <h3 className="font-semibold mt-1">{stage.phase}</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      {stage.title}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {stage.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Practice areas & range ─────────────────────────────── */}
        <section aria-labelledby="practice" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-10">
              <h2 id="practice" className="text-3xl font-bold mb-6">
                Four practice areas, one team
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                The four areas below are how the work is described. They are not
                how it is staffed — the same engineers cross between them,
                because a system that needs an AI feature also needs the data
                platform, the identity model, and the infrastructure it runs on.
                All{" "}
                <Link
                  href="/solutions"
                  className="text-primary underline hover:no-underline"
                >
                  {SERVICES.length} engineering disciplines
                </Link>{" "}
                sit in the same practice for that reason.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ORG_DISCIPLINES.map((discipline) => (
                  <li
                    key={discipline}
                    className="bg-card border border-white/5 rounded-xl p-5 flex items-center gap-4"
                  >
                    <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon
                        name={DISCIPLINE_ICONS[discipline]}
                        className="text-primary text-sm"
                      />
                    </span>
                    <h3 className="font-semibold text-sm">{discipline}</h3>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-600 mt-8">
                Stack chosen per system, not by habit — {TECHNOLOGIES.join(", ")}{" "}
                and the rest of the toolchain each engagement actually calls for.
              </p>
            </div>

            <div className="glass rounded-3xl p-10">
              <h2 className="text-3xl font-bold mb-6">What we don&apos;t do</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Three refusals shape more of the work than any list of
                capabilities does. Each one costs us conversations, and each one
                exists because the alternative costs clients more.
              </p>
              <ul className="space-y-4">
                {REFUSALS.map((refusal) => (
                  <li
                    key={refusal.title}
                    className="bg-card border border-white/5 rounded-xl p-6"
                  >
                    <h3 className="font-bold mb-2">{refusal.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {refusal.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <Icon name="microphone" className="text-blue-400 text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                The fastest way to judge us is to use us
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Describe your problem to the AI Architect and see what a defined
                system looks like before anyone talks about money. Or skip
                ahead and book thirty minutes with the engineers who would
                build it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/discovery"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  <Icon name="microphone" className="mr-2" /> Start Discovery
                </Link>
                <Link
                  href="/contact?intent=schedule"
                  className="px-8 py-4 border border-white/15 rounded-full font-semibold hover:bg-white/5 transition-colors"
                >
                  Schedule a Discovery Call
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro="How engagements start, why the estimate comes after discovery, and what end-to-end ownership means in practice."
          faqs={ABOUT_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
