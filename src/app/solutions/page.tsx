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
import { SOLUTIONS_FAQS } from "@/lib/faq";
import {
  SERVICES,
  SERVICE_CATEGORIES,
  type Service,
  type ServiceCategory,
} from "@/lib/content";

/** Entity cluster: the pages a reader of this one most likely wants next. */
const RELATED = [
  {
    href: "/solutions/cybersecurity",
    title: "Cybersecurity",
    blurb:
      "The security practice in depth — offensive testing, defensive architecture, and 24/7 operations.",
  },
  {
    href: "/industries",
    title: "Industries",
    blurb:
      "How these disciplines apply across the 15 sectors we already speak the language of.",
  },
  {
    href: "/discovery",
    title: "AI Discovery Center",
    blurb:
      "Describe the problem and get back a system definition naming the disciplines it needs.",
  },
];

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "We don't sell software packages. We engineer technology systems built around your business — 20 engineering disciplines spanning AI, software, security, cloud, and business systems.",
  alternates: { canonical: "/solutions" },
};

/**
 * Tailwind scans for literal class names, so the per-category divider colours
 * are spelled out rather than interpolated from `category.color`.
 */
const CATEGORY_STYLES: Record<
  ServiceCategory,
  { label: string; rule: string }
> = {
  ai: { label: "text-purple-400", rule: "from-purple-500/50" },
  engineering: { label: "text-blue-400", rule: "from-blue-500/50" },
  security: { label: "text-red-400", rule: "from-red-500/50" },
  business: { label: "text-emerald-400", rule: "from-emerald-500/50" },
  industry: { label: "text-amber-400", rule: "from-amber-500/50" },
};

/** Density of each category block, matching the approved design. */
const CATEGORY_GRID: Record<ServiceCategory, string> = {
  ai: "grid-cols-1 md:grid-cols-2",
  engineering: "grid-cols-1 md:grid-cols-3",
  security: "grid-cols-1 md:grid-cols-3",
  business: "grid-cols-2 md:grid-cols-4",
  industry: "grid-cols-2 md:grid-cols-4",
};

const STATS = [
  { value: String(SERVICES.length), label: "Engineering Disciplines" },
  { value: "15+", label: "Industries Served" },
  { value: "50+", label: "Technologies" },
];

// The AI Architect is the conversion path — only cybersecurity has a detail page.
function serviceHref(service: Service) {
  return service.slug === "cybersecurity"
    ? "/solutions/cybersecurity"
    : "/discovery";
}

function accentVars(service: Service) {
  return {
    "--accent": service.accent,
    "--accent-rgb": service.accentRgb,
  } as React.CSSProperties;
}

/** Icon tile tinted from the card's own accent vars. */
function IconTile({
  service,
  size,
}: {
  service: Service;
  size: "lg" | "md" | "sm";
}) {
  const box =
    size === "lg"
      ? "w-12 h-12 rounded-xl"
      : size === "md"
        ? "w-10 h-10 rounded-xl"
        : "w-9 h-9 rounded-lg";
  const glyph = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "";
  return (
    <div
      className={`${box} border flex items-center justify-center`}
      style={{
        backgroundColor: "rgba(var(--accent-rgb),0.1)",
        borderColor: "rgba(var(--accent-rgb),0.22)",
      }}
    >
      <Icon name={service.icon} className={`${service.color} ${glyph}`} />
    </div>
  );
}

function Tags({ service, compact }: { service: Service; compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
      {service.tags.map((tag) => (
        <li
          key={tag}
          className={`text-xs text-gray-500 border border-white/10 rounded-full ${
            compact ? "px-2 py-0.5" : "px-2.5 py-1"
          }`}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({ service }: { service: Service }) {
  return (
    <Link
      href={serviceHref(service)}
      className="service-card group rounded-2xl p-8"
      style={accentVars(service)}
    >
      <div className="flex items-start justify-between mb-6">
        <IconTile service={service} size="lg" />
        <Icon name="arrow-up-right" className="text-gray-600 service-arrow" />
      </div>
      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-5">
        {service.description}
      </p>
      <Tags service={service} />
    </Link>
  );
}

function StandardCard({ service }: { service: Service }) {
  return (
    <Link
      href={serviceHref(service)}
      className="service-card group rounded-2xl p-7"
      style={accentVars(service)}
    >
      <div className="mb-5">
        <IconTile service={service} size="md" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold mb-2">{service.title}</h3>
        <Icon
          name="arrow-up-right"
          className="text-gray-600 text-xs service-arrow shrink-0"
        />
      </div>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">
        {service.description}
      </p>
      <Tags service={service} compact />
    </Link>
  );
}

function CompactCard({ service }: { service: Service }) {
  return (
    <Link
      href={serviceHref(service)}
      className="service-card group rounded-xl p-6"
      style={accentVars(service)}
    >
      <div className="mb-4">
        <IconTile service={service} size="sm" />
      </div>
      <h3 className="font-bold mb-1">{service.title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">
        {service.description}
      </p>
    </Link>
  );
}

export default function SolutionsPage() {
  // This page is the canonical description of all 20 disciplines, so it emits
  // a Service node for each one and the graph hangs them off the organization.
  const schema = pageSchema({
    path: "/solutions",
    name: "Engineering Solutions",
    description:
      "20 engineering disciplines spanning AI, software engineering, security, cloud, and business systems.",
    breadcrumbs: [{ name: "Solutions", path: "/solutions" }],
    faqs: SOLUTIONS_FAQS,
    services: SERVICES.map((s) => s.slug),
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
              <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 block">
                {SERVICES.length} Engineering Disciplines
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
                Engineering
                <br />
                Solutions
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                We don&apos;t sell software packages. We engineer technology
                systems built around your business. Every service is
                interconnected — security runs through everything, AI
                accelerates everything, cloud powers everything.
              </p>

              <AnswerBlock
                question="What engineering disciplines does SoftwarePros cover?"
                className="mt-10"
              >
                SoftwarePros covers 20 engineering disciplines in five
                categories: AI and intelligence, software engineering, security
                and infrastructure, business systems, and industry-specific
                systems. They are delivered as one practice because the
                disciplines depend on each other — an AI feature is only as
                sound as the data platform and security model beneath it.
              </AnswerBlock>
            </div>

            <dl className="flex flex-wrap gap-12 mt-14 pt-10 border-t border-white/5">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-3xl font-bold mb-1">{stat.value}</dd>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Disciplines by category ────────────────────────────── */}
        <div className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            {SERVICE_CATEGORIES.map((category) => {
              const services = SERVICES.filter(
                (s) => s.category === category.key,
              );
              const style = CATEGORY_STYLES[category.key];
              return (
                <section
                  key={category.key}
                  id={category.key}
                  aria-labelledby={`${category.key}-heading`}
                  className="mb-16 scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div
                      className={`h-px flex-1 bg-gradient-to-r ${style.rule} to-transparent`}
                    />
                    <h2
                      id={`${category.key}-heading`}
                      className={`text-xs font-bold tracking-widest uppercase ${style.label}`}
                    >
                      {category.label}
                    </h2>
                    <div
                      className={`h-px flex-1 bg-gradient-to-l ${style.rule} to-transparent`}
                    />
                  </div>

                  <div className={`grid gap-4 ${CATEGORY_GRID[category.key]}`}>
                    {services.map((service) => {
                      if (category.key === "ai") {
                        return (
                          <FeatureCard key={service.slug} service={service} />
                        );
                      }
                      if (
                        category.key === "engineering" ||
                        category.key === "security"
                      ) {
                        return (
                          <StandardCard key={service.slug} service={service} />
                        );
                      }
                      return (
                        <CompactCard key={service.slug} service={service} />
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* ── CTA ────────────────────────────────────────────── */}
            <section className="glass rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <Icon name="microphone" className="text-blue-400 text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Not sure which solution you need?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Describe your business problem to our AI Architect. It will
                identify the right technology solution for your specific
                situation.
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
            </section>
          </div>
        </div>

        {/* ── Related ────────────────────────────────────────────── */}
        <section
          aria-labelledby="related-heading"
          className="px-6 pb-24 max-w-7xl mx-auto"
        >
          <h2
            id="related-heading"
            className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-6 pt-10 border-t border-white/5"
          >
            Related
          </h2>
          <ul className="grid sm:grid-cols-3 gap-4">
            {RELATED.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="glass rounded-2xl p-6 block h-full hover:border-white/20 transition-colors"
                >
                  <span className="block font-semibold mb-1">{item.title}</span>
                  <span className="block text-sm text-gray-400 leading-relaxed">
                    {item.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro="What the disciplines cover, when custom software is the right call, and how existing systems fit in."
          faqs={SOLUTIONS_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
