import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { Icon } from "@/components/Icon";
import { ContactForm, type LeadSource } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { FaqSection } from "@/components/seo/FaqSection";
import { pageSchema } from "@/lib/schema";
import { CONTACT_FAQS } from "@/lib/faq";
import {
  ORG_ADDRESS_LINES,
  ORG_EMAIL,
  ORG_NAME,
  ORG_PHONE_DISPLAY,
  ORG_PHONE_E164,
} from "@/lib/org";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us what you're building. Request a security assessment, book a discovery call, or start a project with the SoftwarePros engineering team.",
  alternates: { canonical: "/contact" },
};

type Intent = "assessment" | "schedule" | "project";

type IntentCopy = {
  kicker: string;
  heading: readonly [string, string];
  blurb: string;
  source: LeadSource;
  submitLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  formTitle: string;
  steps: readonly { icon: string; title: string; body: string }[];
};

const INTENTS: Record<Intent, IntentCopy> = {
  assessment: {
    kicker: "Cybersecurity",
    heading: ["Request a Security", "Assessment."],
    blurb:
      "Tell us what you run and what worries you. We map your attack surface, test what's exposed, and hand back a prioritised remediation plan — not a 200-page PDF nobody reads.",
    source: "assessment",
    submitLabel: "Request Assessment",
    messageLabel: "What should we look at?",
    messagePlaceholder:
      "Environments, compliance drivers (SOC 2, HIPAA, PCI), recent incidents, anything already known to be weak.",
    formTitle: "Assessment request",
    steps: [
      {
        icon: "crosshairs",
        title: "Scoping call — 30 minutes",
        body: "We agree the boundary: what's in scope, what's off-limits, and when testing runs.",
      },
      {
        icon: "magnifying-glass",
        title: "Assessment window",
        body: "External and internal review, with critical findings reported the moment we confirm them.",
      },
      {
        icon: "list-check",
        title: "Prioritised remediation plan",
        body: "Findings ranked by real exploitability, each with a concrete fix and an owner.",
      },
    ],
  },
  schedule: {
    kicker: "Discovery",
    heading: ["Book a Discovery", "Call."],
    blurb:
      "Thirty minutes with the engineers who would actually build it. Bring the problem, not a spec — we'll leave you with an honest read on feasibility, sequencing, and cost drivers.",
    source: "schedule",
    submitLabel: "Request a Call",
    messageLabel: "What would you like to cover?",
    messagePlaceholder:
      "The problem you're solving, who it's for, and anything already in flight. Time zones and preferred slots help too.",
    formTitle: "Call request",
    steps: [
      {
        icon: "calendar-check",
        title: "We confirm a slot",
        body: "You get two or three options within one business day — no scheduling ping-pong.",
      },
      {
        icon: "comments",
        title: "The call itself",
        body: "Engineers, not account managers. We ask the questions that change the architecture.",
      },
      {
        icon: "file-lines",
        title: "A written follow-up",
        body: "A short summary of the approach we'd take, the risks we see, and what we'd need next.",
      },
    ],
  },
  project: {
    kicker: "Start a project",
    heading: ["Tell Us What", "You're Building."],
    blurb:
      "Systems that outlast vendor lock-in, scale under pressure, and survive the unexpected. Describe the problem in your own words — an engineer reads every message.",
    source: "contact",
    submitLabel: "Send Message",
    messageLabel: "Project details",
    messagePlaceholder:
      "What are you building, what's broken, or what you need to decide. Constraints and deadlines welcome.",
    formTitle: "Start the conversation",
    steps: [
      {
        icon: "envelope",
        title: "An engineer reads it",
        body: "Every message lands with someone who could build the thing, usually the same day.",
      },
      {
        icon: "comments",
        title: "A short discovery call",
        body: "Thirty minutes to pressure-test the problem before anyone talks about scope or price.",
      },
      {
        icon: "route",
        title: "A written plan",
        body: "Architecture, phases, and the trade-offs behind each — in plain language you can forward.",
      },
    ],
  },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.trim() ? raw.trim() : undefined;
}

function toIntent(value: string | undefined): Intent {
  return value === "assessment" || value === "schedule" || value === "project"
    ? value
    : "project";
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const intent = toIntent(firstParam(params.intent));
  const copy = INTENTS[intent];
  const summaryId = firstParam(params.summary);
  const sessionId = firstParam(params.session);
  const linked = summaryId ?? sessionId;

  const schema = pageSchema({
    path: "/contact",
    type: "ContactPage",
    name: `Contact ${ORG_NAME}`,
    description:
      "Request a security assessment, book a discovery call, or start a project with the SoftwarePros engineering team.",
    breadcrumbs: [{ name: "Contact", path: "/contact" }],
    faqs: CONTACT_FAQS,
  });

  return (
    <>
      <JsonLd data={schema} />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main" className="bg-ink">
        <section className="pt-40 pb-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* ── Pitch ─────────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6">
                  {copy.kicker}
                </p>
                <h1 className="text-5xl md:text-7xl font-black leading-[0.95] mb-8">
                  {copy.heading[0]}
                  <br />
                  {copy.heading[1]}
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mb-12">
                  {copy.blurb}
                </p>

                {linked && (
                  <p className="inline-flex items-center gap-2 mb-12 text-sm text-gray-300 glass-blue rounded-full px-4 py-2">
                    <span className="ai-badge">Linked</span>
                    Your AI discovery conversation is attached to this message.
                  </p>
                )}

                <div className="mb-12">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-6">
                    What happens next
                  </h2>
                  <ol className="space-y-6">
                    {copy.steps.map((step, i) => (
                      <li key={step.title} className="flex gap-5">
                        <span
                          aria-hidden="true"
                          className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400"
                        >
                          <Icon name={step.icon} />
                        </span>
                        <div>
                          <p className="font-semibold mb-1">
                            <span className="text-gray-600 font-mono text-xs mr-2">
                              0{i + 1}
                            </span>
                            {step.title}
                          </p>
                          <p className="text-sm text-gray-500 max-w-md">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* ── Alternatives ────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <Link
                    href="/discovery"
                    className="glass-card p-6 rounded-hex flex flex-col hover:border-white/20 transition-colors"
                  >
                    <Icon
                      name="robot"
                      className="text-2xl text-primary mb-4"
                    />
                    <span className="font-bold mb-2">Talk to the AI Architect</span>
                    <span className="text-gray-500 text-xs">
                      Describe the project by voice or text and get a system
                      definition back in minutes.
                    </span>
                  </Link>
                  <a
                    href="mailto:hello@softwarepros.org"
                    className="glass-card p-6 rounded-hex flex flex-col hover:border-white/20 transition-colors"
                  >
                    <Icon
                      name="envelope"
                      className="text-2xl text-primary mb-4"
                    />
                    <span className="font-bold mb-2">Email us directly</span>
                    <span className="text-gray-500 text-xs">
                      hello@softwarepros.org — for NDAs, RFPs, and anything that
                      doesn&apos;t fit in a form.
                    </span>
                  </a>
                </div>

                {/* ── NAP ─────────────────────────────────────────────
                    Name, address and phone rendered from the same
                    constants as the LocalBusiness structured data. Local
                    search cross-checks the two, and an address that
                    exists only in the markup reads as a mismatch. */}
                <address className="mt-10 not-italic grid sm:grid-cols-2 gap-6 max-w-xl">
                  <div className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400"
                    >
                      <Icon name="location-dot" />
                    </span>
                    <div>
                      <p className="font-semibold mb-1 text-sm">Office</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {ORG_ADDRESS_LINES.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400"
                    >
                      <Icon name="headset" />
                    </span>
                    <div>
                      <p className="font-semibold mb-1 text-sm">Phone</p>
                      <a
                        href={`tel:${ORG_PHONE_E164}`}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {ORG_PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>
                </address>

                <p className="text-xs text-gray-600 mt-8">
                  {intent === "assessment" ? (
                    <>
                      Not a security question?{" "}
                      <Link href="/contact" className="underline hover:text-gray-400">
                        Start a project instead
                      </Link>
                      .
                    </>
                  ) : intent === "schedule" ? (
                    <>
                      Worried about something specific?{" "}
                      <Link
                        href="/contact?intent=assessment"
                        className="underline hover:text-gray-400"
                      >
                        Request a security assessment
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Prefer to talk it through?{" "}
                      <Link
                        href="/contact?intent=schedule"
                        className="underline hover:text-gray-400"
                      >
                        Book a discovery call
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>

              {/* ── Form ──────────────────────────────────────────── */}
              <div className="glass rounded-3xl p-8 md:p-10 lg:sticky lg:top-28">
                <h2 className="text-2xl font-bold mb-2">{copy.formTitle}</h2>
                <p className="text-sm text-gray-500 mb-8">
                  Replies come from an engineer within one business day.
                </p>
                <ContactForm
                  source={copy.source}
                  sessionId={sessionId}
                  summaryId={summaryId}
                  submitLabel={copy.submitLabel}
                  messageLabel={copy.messageLabel}
                  messagePlaceholder={copy.messagePlaceholder}
                />
              </div>
            </div>
          </div>
        </section>

        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro={`How to reach the team, what happens after you get in touch, and when to just email ${ORG_EMAIL}.`}
          faqs={CONTACT_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
