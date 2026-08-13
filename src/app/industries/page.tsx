import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { FaqSection } from "@/components/seo/FaqSection";
import { pageSchema, abs } from "@/lib/schema";
import { INDUSTRIES_FAQS } from "@/lib/faq";
import { INDUSTRIES, PIPELINE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Domain fluency across 15 industries — the regulatory regimes, operational vocabulary, and integration realities that decide whether a system gets used or worked around.",
  alternates: { canonical: "/industries" },
};

/**
 * What we actually build for each vertical. Keyed by industry slug so the
 * grid stays driven by INDUSTRIES and nothing drifts out of sync.
 */
const INDUSTRY_DETAIL: Record<string, string> = {
  healthcare:
    "HIPAA-compliant patient portals, EHR and HL7/FHIR integration, telehealth scheduling, and e-prescribing workflows — with the consent tracking and audit logging your compliance officer asks about on day one.",
  hospice:
    "Offline-capable point-of-care charting for field nurses, IDG meeting documentation, bereavement and volunteer tracking, and Medicare hospice benefit billing that holds up under a CMS review.",
  logistics:
    "Warehouse and transportation management with EDI 204/214/210 exchange, dock and yard scheduling, pick-path optimization, and 3PL client portals showing live inventory and shipment status.",
  transportation:
    "Dispatch boards, driver mobile apps that capture proof of delivery offline, ELD and hours-of-service reporting, DVIR and maintenance workflows, and routing scored against real fuel and toll cost.",
  "hotshot-trucking":
    "Load board integrations, rate confirmation and BOL capture from a phone, ELD compliance, IFTA fuel tax reporting, and settlement automation that pays drivers without a spreadsheet.",
  manufacturing:
    "MES and shop-floor terminals, OPC-UA and IoT sensor telemetry, OEE dashboards, lot and serial traceability for recalls, and ERP integration that keeps schedules and inventory in step.",
  government:
    "Constituent service portals, permitting and licensing workflows, records retention and FOIA tracking, plus the Section 508 / WCAG accessibility and procurement documentation public contracts demand.",
  municipalities:
    "Utility billing, code enforcement, 311 request routing and work orders, and council agenda publishing — integrated with the legacy county systems you are not replacing this budget cycle.",
  construction:
    "Field-first daily logs and photo documentation over poor connectivity, RFI and submittal tracking, change-order approvals, certified prevailing-wage payroll, and job costing tied to your accounting ledger.",
  "real-estate":
    "MLS/IDX-fed listing sites, tenant and owner portals, lease and e-signature document workflows, maintenance ticketing, and CRM automation that follows up on every lead without a manual reminder.",
  finance:
    "Ledger-accurate transaction systems, KYC/AML screening, ACH and card rails, SOC 2 control implementation, and reporting pipelines that reconcile to the penny when an auditor pulls the trail.",
  insurance:
    "First-notice-of-loss intake, claims adjudication workflows, underwriting rules engines, agent and broker portals, and policy document automation wired into your rating and carrier APIs.",
  "professional-services":
    "Time and expense capture, utilization and realization dashboards, proposal-to-engagement CRM automation, matter workspaces, and billing that handles retainers, milestones, and pass-through costs.",
  retail:
    "POS and e-commerce running off one inventory source of truth, omnichannel order routing, loyalty programs, PCI-compliant payment flows, and forecasting that keeps stores and warehouses aligned.",
  technology:
    "Multi-tenant SaaS architecture, usage-based metering and billing, SSO and SCIM for enterprise buyers, versioned rate-limited API platforms, and the SOC 2 evidence your first enterprise deal requires.",
};

export default function IndustriesPage() {
  const schema = pageSchema({
    path: "/industries",
    name: "Industries Served",
    description:
      "Domain fluency across 15 industries — the regulatory regimes, operational vocabulary, and integration realities of each sector.",
    breadcrumbs: [{ name: "Industries", path: "/industries" }],
    faqs: INDUSTRIES_FAQS,
    // An explicit ItemList so a crawler reads 15 named industries rather than
    // inferring them from a grid of cards.
    extra: [
      {
        "@type": "ItemList",
        "@id": `${abs("/industries")}#industries`,
        name: "Industries served by SoftwarePros",
        numberOfItems: INDUSTRIES.length,
        itemListElement: INDUSTRIES.map((industry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: industry.name,
          url: `${abs("/industries")}#${industry.slug}`,
        })),
      },
    ],
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
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 mb-4 block">
                {INDUSTRIES.length} Industries Served
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
                We Speak Your
                <br />
                Industry&apos;s Language
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Domain fluency is what separates software people use from
                software people work around. We come in already knowing the
                regulatory regime, the operational vocabulary, and the
                integration realities of your sector — so discovery starts at
                your problem, not at a glossary.
              </p>

              <AnswerBlock
                question="Why does industry experience matter in software?"
                className="mt-10"
              >
                Industry experience decides where a project starts. A team that
                already knows what HL7 means in healthcare, what an EDI 214
                carries in logistics, or what a prevailing-wage payroll run has
                to produce in construction begins discovery at the real problem
                instead of a glossary. Software that misreads the domain does
                not get used — it gets worked around.
              </AnswerBlock>
            </div>

            <dl className="flex flex-wrap gap-12 mt-14 pt-10 border-t border-white/5">
              <div>
                <dd className="text-3xl font-bold mb-1">{INDUSTRIES.length}</dd>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Industries Served
                </dt>
              </div>
              <div>
                <dd className="text-3xl font-bold mb-1">20</dd>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Engineering Disciplines
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

        {/* ── Industry grid ──────────────────────────────────────── */}
        <section aria-labelledby="verticals" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
              <h2
                id="verticals"
                className="text-xs font-bold tracking-widest uppercase text-emerald-400"
              >
                Where We Work
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDUSTRIES.map((industry) => (
                <article
                  key={industry.slug}
                  id={industry.slug}
                  className={`scroll-mt-24 bg-card border border-white/5 rounded-2xl p-7 transition-colors ${industry.hover}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    <Icon name={industry.icon} className={industry.color} />
                  </div>
                  <h3 className="text-lg font-bold">{industry.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {industry.tagline}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {INDUSTRY_DETAIL[industry.slug]}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Same pipeline, every vertical ──────────────────────── */}
        <section aria-labelledby="pipeline" className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card rounded-3xl p-10 md:p-12">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 block">
                One Delivery Pipeline
              </span>
              <h2
                id="pipeline"
                className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
              >
                The vocabulary changes. The engineering discipline doesn&apos;t.
              </h2>
              <p className="text-gray-400 max-w-2xl leading-relaxed mb-10">
                A hospice charting app and a freight settlement system share
                almost no domain language — but both go through the same{" "}
                {PIPELINE.length} stages. Industry knowledge shapes what we
                build in discovery and design; the security review, the
                infrastructure-as-code deploy, and the observability that comes
                after are identical either way.
              </p>
              <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PIPELINE.map((item) => (
                  <li
                    key={item.step}
                    className="bg-card border border-white/5 rounded-xl p-5"
                  >
                    <span className="text-xs font-bold text-primary">
                      {item.step}
                    </span>
                    <h3 className="font-semibold mt-1">{item.phase}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.title}</p>
                  </li>
                ))}
              </ol>
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
                Don&apos;t see your industry?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Describe how your business actually operates to our AI
                Architect. It will map your workflows to the right technology
                solution — vertical listed here or not.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/discovery"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  <Icon name="microphone" className="mr-2" /> Tell Us What You
                  Need
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

        {/* ── FAQ ──────────────────────────────────────── */}
        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro="Why domain experience changes where a project starts, and what building for a regulated sector actually involves."
          faqs={INDUSTRIES_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
