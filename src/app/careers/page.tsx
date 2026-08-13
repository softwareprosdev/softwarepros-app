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
import { CAREERS_FAQS } from "@/lib/faq";
import {
  INDUSTRIES,
  PIPELINE,
  SERVICES,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "@/lib/content";
import { ORG_EMAIL, ORG_NAME } from "@/lib/org";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "SoftwarePros does not list open roles on this site. What the engineering bar is, what the work involves day to day, and how to send a speculative application.",
  alternates: { canonical: "/careers" },
};

/** Tailwind scans for literal class names, so these are spelled out. */
const CATEGORY_STYLES: Record<ServiceCategory, string> = {
  ai: "text-purple-400",
  engineering: "text-blue-400",
  security: "text-red-400",
  business: "text-emerald-400",
  industry: "text-amber-400",
};

/** The bar, stated as behaviour rather than years of experience. */
const BAR = [
  {
    icon: "user-tie",
    title: "You own the system, not the ticket",
    body: "The engineer who designs a system builds it, secures it, deploys it, and watches it run. If you want an architecture handed to you and a queue to work through, this is the wrong shape of job.",
  },
  {
    icon: "shield-halved",
    title: "You treat security as a design decision",
    body: "Authentication model, data boundaries, blast radius, audit trail — settled during architecture. An engineer here should be able to say what an attacker would try before anyone schedules a test.",
  },
  {
    icon: "comments",
    title: "You learn the domain well enough to argue",
    body: "Requirements arrive from people who know their business and not your constraints. The useful engineer is the one who understands the workflow well enough to say a requirement is wrong, and why.",
  },
  {
    icon: "file-invoice-dollar",
    title: "You refuse to estimate what isn't scoped",
    body: "Guessing a number to end an uncomfortable conversation is the most expensive habit in this industry. Define the work, then price it — the same rule that applies to the firm applies to you.",
  },
  {
    icon: "gauge",
    title: "You operate what you ship",
    body: "Observability, scaling, and cost are part of the build, not somebody else's phase. Systems here keep running after launch, and the people who wrote them are the ones watching the telemetry.",
  },
  {
    icon: "cubes",
    title: "You go broad before you go deep",
    body: `Range across the ${SERVICES.length} disciplines matters more than mastery of one framework. Most engagements need a data platform, an identity model, and infrastructure before they need a favourite library.`,
  },
];

export default function CareersPage() {
  const schema = pageSchema({
    path: "/careers",
    name: `Careers at ${ORG_NAME}`,
    description:
      "The engineering bar at SoftwarePros, what the work involves across 20 disciplines and 15 industries, and how to apply when no roles are posted.",
    breadcrumbs: [{ name: "Careers", path: "/careers" }],
    faqs: CAREERS_FAQS,
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
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4 block">
                Careers
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
                Own the System,
                <br />
                Not the Ticket
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                There are no openings listed on this site. That is not a soft
                no — it means the roles are not posted, not that the inbox is
                closed. If you build systems end to end and want to do it across{" "}
                {SERVICES.length} disciplines rather than one, write to us with
                what you have built.
              </p>

              <AnswerBlock
                question="Is SoftwarePros hiring right now?"
                className="mt-10"
              >
                SoftwarePros does not list open roles on this site. Speculative
                applications are still read: email {ORG_EMAIL} describing what
                you have built — systems you designed, code you can show,
                problems you owned from architecture through production. There
                is no application portal and no requisition list to check; the
                inbox is the process.
              </AnswerBlock>
            </div>

            <dl className="flex flex-wrap gap-12 mt-14 pt-10 border-t border-white/5">
              <div>
                <dd className="text-3xl font-bold mb-1">{SERVICES.length}</dd>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Engineering Disciplines
                </dt>
              </div>
              <div>
                <dd className="text-3xl font-bold mb-1">{INDUSTRIES.length}</dd>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Industries Served
                </dt>
              </div>
              <div>
                <dd className="text-3xl font-bold mb-1">{PIPELINE.length}</dd>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Stage Delivery Pipeline
                </dt>
              </div>
            </dl>
          </div>
        </section>

        {/* ── The bar ────────────────────────────────────────────── */}
        <section aria-labelledby="bar" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
              <h2
                id="bar"
                className="text-xs font-bold tracking-widest uppercase text-amber-400"
              >
                The Engineering Bar
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BAR.map((item) => (
                <article
                  key={item.title}
                  className="bg-card border border-white/5 rounded-2xl p-7 transition-colors hover:border-amber-500/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    <Icon name={item.icon} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── What the work is ───────────────────────────────────── */}
        <section aria-labelledby="work" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card rounded-3xl p-10 md:p-12">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 block">
                The Work
              </span>
              <h2
                id="work"
                className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
              >
                What you would actually be building.
              </h2>
              <p className="text-gray-400 max-w-2xl leading-relaxed mb-10">
                The practice covers{" "}
                <Link
                  href="/solutions"
                  className="text-primary underline hover:no-underline"
                >
                  {SERVICES.length} engineering disciplines
                </Link>{" "}
                applied across{" "}
                <Link
                  href="/industries"
                  className="text-primary underline hover:no-underline"
                >
                  {INDUSTRIES.length} industries
                </Link>
                . Nobody works in one column of this table for long — a hospice
                charting app needs offline mobile, an identity model, and an
                audit trail before it needs anything clever.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICE_CATEGORIES.map((category) => (
                  <article
                    key={category.key}
                    className="bg-card border border-white/5 rounded-xl p-6"
                  >
                    <h3
                      className={`text-xs font-bold tracking-widest uppercase mb-4 ${CATEGORY_STYLES[category.key]}`}
                    >
                      {category.label}
                    </h3>
                    <ul className="space-y-3">
                      {SERVICES.filter((s) => s.category === category.key).map(
                        (service) => (
                          <li key={service.slug} className="flex gap-3">
                            <Icon
                              name={service.icon}
                              className={`${service.color} text-sm mt-1 shrink-0`}
                            />
                            <span>
                              <span className="block text-sm font-semibold">
                                {service.title}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {service.tagline}
                              </span>
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How hiring works ───────────────────────────────────── */}
        <section aria-labelledby="apply" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-10">
              <h2 id="apply" className="text-3xl font-bold mb-6">
                How to apply
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                No roles are posted, so there is nothing to apply <em>to</em> —
                only someone to write to. A speculative message that describes
                real systems is treated the same as a response to a posting
                would be.
              </p>
              <ol className="space-y-6">
                <li className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"
                  >
                    <Icon name="envelope" />
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Email {ORG_EMAIL}
                    </h3>
                    <p className="text-sm text-gray-500">
                      One address, no portal, no form that discards your
                      formatting. Put &ldquo;engineering&rdquo; somewhere in the
                      subject so it routes to the right inbox.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"
                  >
                    <Icon name="code" />
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Lead with what you have built
                    </h3>
                    <p className="text-sm text-gray-500">
                      Systems you designed, repositories we can read, a problem
                      you owned from architecture through production. A list of
                      technologies tells us far less than one system explained
                      honestly, including what you would do differently.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"
                  >
                    <Icon name="user-tie" />
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">
                      An engineer reads it, not a recruiter
                    </h3>
                    <p className="text-sm text-gray-500">
                      The same people who would work alongside you read the
                      message, which is also why it is worth writing about the
                      engineering rather than about yourself in the abstract.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="glass rounded-3xl p-10">
              <h2 className="text-3xl font-bold mb-6">Before you write</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Two pages will tell you more about the day-to-day than any job
                description could, because they describe the work as it is sold
                — which is the work as it is done.
              </p>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="bg-card border border-white/5 rounded-xl p-6 block hover:border-white/20 transition-colors"
                  >
                    <h3 className="font-bold mb-1">How the firm works</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Discovery before code, security as a design constraint,
                      and the {PIPELINE.length}-stage pipeline every system
                      runs through.
                    </p>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions/cybersecurity"
                    className="bg-card border border-white/5 rounded-xl p-6 block hover:border-white/20 transition-colors"
                  >
                    <h3 className="font-bold mb-1">
                      The security practice in depth
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Offensive testing, defensive architecture, and operations
                      — the standard every other discipline here is held to.
                    </p>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/discovery"
                    className="bg-card border border-white/5 rounded-xl p-6 block hover:border-white/20 transition-colors"
                  >
                    <h3 className="font-bold mb-1">The AI Discovery Center</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The tool that turns a described problem into a system
                      definition. Use it on a problem of your own and you will
                      know what the first week here feels like.
                    </p>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                <Icon name="envelope" className="text-amber-400 text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                No opening to answer? Write anyway.
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Tell us what you have built and what you want to build next.
                Client work goes through the contact form; engineering
                applications go straight to the inbox below.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`mailto:${ORG_EMAIL}?subject=Engineering`}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  <Icon name="envelope" className="mr-2" /> Email {ORG_EMAIL}
                </a>
                <Link
                  href="/contact"
                  className="px-8 py-4 border border-white/15 rounded-full font-semibold hover:bg-white/5 transition-colors"
                >
                  Client enquiry instead
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro="Whether roles are open, how to apply when none are posted, and what the firm looks for in an engineer."
          faqs={CAREERS_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
