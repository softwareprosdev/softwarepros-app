import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { ParticleField } from "@/components/ParticleField";
import { Icon } from "@/components/Icon";
import { HeroOrb } from "@/components/home/HeroOrb";
import { EngagementCards } from "@/components/home/EngagementCards";
import { JsonLd } from "@/components/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { FaqSection } from "@/components/seo/FaqSection";
import { pageSchema } from "@/lib/schema";
import { HOME_FAQS } from "@/lib/faq";
import { ORG_DESCRIPTION } from "@/lib/org";
import {
  INDUSTRIES,
  PIPELINE,
  SERVICES,
  TECHNOLOGIES,
  TRUST_STATS,
} from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  path: "/",
  // `title.default` in the root layout already carries the untemplated title;
  // repeating it here would render "… | SoftwarePros | SoftwarePros".
  title: "Software Engineering Services",
  description: ORG_DESCRIPTION,
  socialTitle: "Build Software That Doesn't Break | SoftwarePros",
  socialDescription:
    "AI-first software engineering, cybersecurity, and cloud infrastructure. 20 disciplines, 15 industries.",
});

const DISCOVERY_PANELS = [
  {
    kicker: "AI Conversation",
    title: "Project Scoping",
    icon: "comments",
    features: [
      { icon: "microphone", title: "Voice Input", body: "Describe your project verbally" },
      { icon: "keyboard", title: "Text Input", body: "Type detailed requirements" },
    ],
  },
  {
    kicker: "Document Analysis",
    title: "Upload Review",
    icon: "file-arrow-up",
    features: [
      { icon: "file-arrow-up", title: "Upload Documents", body: "Share specs and briefs" },
      { icon: "image", title: "Image Upload", body: "Paste screenshots and designs" },
    ],
  },
];

const SECURITY_TILES = [
  {
    icon: "radar",
    span: "md:col-span-8",
    aspect: "aspect-video",
    kicker: "Active Threat Detection",
    title: "Enterprise Defense",
    quickview: true,
  },
  {
    icon: "fingerprint",
    span: "md:col-span-4",
    aspect: "aspect-video",
    kicker: "Zero Trust",
    title: "Verified Access",
    quickview: true,
  },
  {
    icon: "shield-halved",
    span: "md:col-span-3",
    aspect: "aspect-video",
    kicker: "Encryption",
    title: "Data At Rest & In Transit",
  },
  {
    icon: "network-wired",
    span: "md:col-span-6",
    aspect: "aspect-video",
    kicker: "Perimeter Defense",
    title: "Network Firewalls",
  },
  {
    icon: "user-secret",
    span: "md:col-span-3",
    aspect: "aspect-video",
    kicker: "Identity",
    title: "Biometric Auth",
  },
];

export default function HomePage() {
  const schema = pageSchema({
    path: "/",
    name: "Software Engineering Services | SoftwarePros",
    description: ORG_DESCRIPTION,
    faqs: HOME_FAQS,
    // The homepage is the hub, so it claims the four headline disciplines and
    // links out to the pages that describe each in full.
    services: [
      "ai-development",
      "custom-software",
      "cybersecurity",
      "cloud-infrastructure",
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
        <section className="relative min-h-screen pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ParticleField className="w-full h-full opacity-60" />
          </div>

          <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row">
            <div className="lg:w-3/5 pt-20 lg:pt-32">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                  AI-First Software Engineering
                </span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 max-w-2xl">
                Build Software That Doesn&apos;t Break.
              </h1>
              <p className="text-xl text-gray-400 mb-12 max-w-lg">
                AI. Software Engineering. Cybersecurity. Cloud Infrastructure. We
                engineer intelligent technology systems for organizations ready
                to replace complexity with automation, security, and scale.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/discovery"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  Start Your Project
                </Link>
                <Link
                  href="/discovery"
                  className="px-8 py-4 glass-card rounded-full font-semibold hover:bg-white/10 transition-colors"
                >
                  Talk To An AI Architect
                </Link>
              </div>

              <AnswerBlock
                question="What is SoftwarePros?"
                className="mt-14 mb-12 lg:mb-0"
              >
                SoftwarePros is a software engineering firm that designs and
                builds custom technology systems across four practice areas —
                artificial intelligence, software engineering, cybersecurity,
                and cloud infrastructure — spanning 20 engineering disciplines
                and 15 industries. Every engagement starts by defining the
                system before any code is written.
              </AnswerBlock>
            </div>

            <div className="lg:w-2/5 flex items-center justify-center py-20 lg:py-0">
              <HeroOrb />
            </div>
          </div>
        </section>

        {/* ── Marquee ────────────────────────────────────────────── */}
        <div className="border-y border-white/5 bg-surface py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-4xl font-bold mx-8 opacity-20">
                SOFTWAREPROS AI
              </span>
            ))}
          </div>
        </div>

        {/* ── Trust ──────────────────────────────────────────────── */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-16">
              <h2 className="text-3xl font-bold max-w-md">
                Engineering-first. AI-native. Security-conscious.
              </h2>
              <p className="text-gray-400 max-w-md mt-6 md:mt-0">
                We partner with forward-thinking teams to design, build, and
                secure the software systems that power their future.
              </p>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
              {TRUST_STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-4xl font-bold mb-2">
                    {stat.value}
                    <span className="text-primary text-2xl">*</span>
                  </dd>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-600 mt-8">
              * Combined figures across the SoftwarePros engineering team.
            </p>
          </div>
        </section>

        {/* ── Services universe ──────────────────────────────────── */}
        <section id="services" className="py-24 bg-ink">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 block">
                  {SERVICES.length} Engineering Disciplines
                </span>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                  The SoftwarePros
                  <br />
                  Technology Universe
                </h2>
              </div>
              <p className="text-gray-400 max-w-xs mt-6 md:mt-0 text-sm">
                Every service is interconnected. We engineer systems, not
                features.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={
                    service.slug === "cybersecurity"
                      ? "/solutions/cybersecurity"
                      : `/solutions#${service.category}`
                  }
                  className="service-card group rounded-xl p-6 flex flex-col gap-4"
                  style={
                    {
                      "--accent": service.accent,
                      "--accent-rgb": service.accentRgb,
                    } as React.CSSProperties
                  }
                >
                  <Icon
                    name={service.icon}
                    className={`text-xl ${service.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-sm font-semibold">{service.title}</span>
                  <span className="text-xs text-gray-500">{service.tagline}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI discovery ───────────────────────────────────────── */}
        <section className="py-24 bg-surface overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <h2 className="text-4xl md:text-6xl font-bold max-w-2xl">
                Your Virtual Senior Software Architect
              </h2>
              <p className="text-gray-400 max-w-md mt-6 md:mt-0">
                Ask SoftwarePros AI anything about software engineering,
                architecture, or cybersecurity.
              </p>
            </div>

            <div className="space-y-24">
              {DISCOVERY_PANELS.map((panel, i) => (
                <div
                  key={panel.title}
                  className={`flex flex-col gap-12 items-center ${
                    i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  <div className="md:w-1/2 w-full">
                    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative group border border-white/5">
                      <div
                        className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:28px_28px]"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-indigo-950/30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon
                          name={panel.icon}
                          className="text-7xl text-white/10 group-hover:text-white/20 group-hover:scale-105 transition-all duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute bottom-6 left-6 z-20">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          {panel.kicker}
                        </span>
                        <h3 className="text-2xl font-bold">{panel.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 space-y-8">
                    {panel.features.map((f) => (
                      <div key={f.title} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <Icon name={f.icon} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold">{f.title}</h4>
                          <p className="text-sm text-gray-500">{f.body}</p>
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/discovery"
                      className="h-16 bg-white/5 rounded-lg flex items-center px-6 text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Start a discovery session →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pipeline ───────────────────────────────────────────── */}
        <section className="py-24 bg-ink">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl md:text-7xl font-bold mb-16">
              From Idea
              <br />
              to Production
            </h2>
            <ol className="relative border-l border-white/10 ml-4 md:ml-10 space-y-12">
              {PIPELINE.map((item, i) => (
                <li key={item.step} className="relative pl-8 md:pl-16">
                  <span
                    className={`absolute -left-1.5 top-2 w-3 h-3 rounded-full ${
                      i === 0
                        ? "bg-primary shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        : "bg-white/20"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="glass-card p-8 rounded-hex hover:bg-white/5 transition-colors">
                    <span className="text-xs font-bold text-primary uppercase">
                      {item.step} — {item.phase}
                    </span>
                    <h3 className="text-2xl font-bold mt-2 mb-4">{item.title}</h3>
                    <p className="text-gray-400">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Security ───────────────────────────────────────────── */}
        <section className="py-24 bg-[#0a0a12] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-red-900/10 mix-blend-multiply" />
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Security Isn&apos;t A Feature.
            </h2>
            <p className="text-5xl md:text-7xl font-bold mb-16 text-gray-500">
              It&apos;s The Foundation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {SECURITY_TILES.map((tile) => (
                <div
                  key={tile.title}
                  className={`${tile.span} ${tile.aspect} rounded-hex overflow-hidden relative group border border-white/5 bg-gradient-to-br from-blue-950/40 via-[#0a0a12] to-red-950/30`}
                >
                  <div
                    className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:22px_22px]"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      name={tile.icon}
                      className="text-6xl text-white/10 group-hover:text-white/20 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-colors" />
                  {tile.kicker && (
                    <div className="absolute bottom-6 left-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                        {tile.kicker}
                      </span>
                      <h3 className="text-2xl font-bold">{tile.title}</h3>
                    </div>
                  )}
                  {tile.quickview && (
                    <Link
                      href="/solutions/cybersecurity"
                      className="absolute bottom-6 right-6 px-6 py-3 border border-white/30 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      Quickview
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Industries ─────────────────────────────────────────── */}
        <section id="industries" className="py-24 bg-ink">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 mb-4 block">
                  {INDUSTRIES.length} Industries Served
                </span>
                <h2 className="text-5xl md:text-7xl font-bold">
                  We Speak Your
                  <br />
                  Industry&apos;s Language
                </h2>
              </div>
              <Link
                href="/industries"
                className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Explore All Industries <Icon name="arrow-right" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {INDUSTRIES.map((industry) => (
                <Link
                  key={industry.slug}
                  href={`/industries#${industry.slug}`}
                  className={`bg-card border border-white/5 p-5 rounded-xl flex items-center gap-3 transition-all ${industry.hover}`}
                >
                  <Icon
                    name={industry.icon}
                    className={`${industry.color} text-lg`}
                  />
                  <div>
                    <div className="text-sm font-semibold">{industry.name}</div>
                    <div className="text-xs text-gray-500">
                      {industry.tagline}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Technology ─────────────────────────────────────────── */}
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
              <div className="md:col-span-4">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  Engineering Laboratory
                </span>
              </div>
              <div className="md:col-span-8">
                <h2 className="text-4xl md:text-6xl font-bold leading-none">
                  Our engineering laboratory combines cutting-edge technologies
                  with proven methodologies to deliver resilient, scalable
                  solutions.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
              <div className="col-span-1">
                <Link href="/solutions" className="flex items-center gap-2 group">
                  <span className="w-8 h-px bg-white group-hover:w-12 transition-all" />
                  <span className="uppercase text-xs font-bold tracking-widest">
                    View All Technologies
                  </span>
                </Link>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {TECHNOLOGIES.map((tech) => (
                  <div
                    key={tech}
                    className="glass-card p-6 rounded-hex text-center font-semibold"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-24 border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-6">
                Engineering Philosophy
              </p>
              <p className="text-3xl md:text-5xl font-bold max-w-5xl mx-auto leading-tight">
                We don&apos;t just write code.
                <br />
                We engineer systems that outlast vendor lock-in, scale under
                pressure, and survive the unexpected.
              </p>
            </div>
          </div>
        </section>

        {/* ── Engagement ─────────────────────────────────────────── */}
        <section className="py-24 bg-ink">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl md:text-7xl font-bold mb-16">
              Tell Us What
              <br />
              You&apos;re Building.
            </h2>
            <EngagementCards />
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <FaqSection
          className="py-24 px-6 bg-surface border-t border-white/5"
          intro="What SoftwarePros does, how the AI Discovery Center works, and how an engagement starts."
          faqs={HOME_FAQS}
        />
      </main>

      <SiteFooter />
      <FloatingAIButton />
    </>
  );
}
