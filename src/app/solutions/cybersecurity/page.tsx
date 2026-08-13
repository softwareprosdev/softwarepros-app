import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { Icon } from "@/components/Icon";
import { ParticleField } from "@/components/ParticleField";
import { SiteNav } from "@/components/SiteNav";
import { SecurityTOC } from "@/components/security/SecurityTOC";
import { SocDashboard } from "@/components/security/SocDashboard";
import { SocTicker } from "@/components/security/SocTicker";
import { JsonLd } from "@/components/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { FaqSection } from "@/components/seo/FaqSection";
import { pageSchema } from "@/lib/schema";
import { CYBERSECURITY_FAQS } from "@/lib/faq";
import {
  CASE_STUDIES,
  COMPLIANCE_FRAMEWORKS,
  SECURITY_CAPABILITIES,
  SECURITY_SECTIONS,
  TESTIMONIALS,
  TRUST_STRIP,
} from "@/lib/security-content";

const ASSESSMENT_HREF = "/contact?intent=assessment";

export const metadata: Metadata = {
  title: "Cybersecurity",
  description:
    "We engineer security into every system we build — and we assess, harden, and defend systems that already exist. Offensive capabilities, defensive architecture, and 24/7 security operations.",
  alternates: { canonical: "/solutions/cybersecurity" },
};

export default function CybersecurityPage() {
  const schema = pageSchema({
    path: "/solutions/cybersecurity",
    name: "Cybersecurity Services",
    description:
      "Offensive security, defensive architecture, and 24/7 security operations — engineered into systems rather than audited onto them.",
    breadcrumbs: [
      { name: "Solutions", path: "/solutions" },
      { name: "Cybersecurity", path: "/solutions/cybersecurity" },
    ],
    faqs: CYBERSECURITY_FAQS,
    services: ["cybersecurity", "security-operations", "managed-it"],
  });

  return (
    <>
      <JsonLd data={schema} />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav variant="security" />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative pt-32 pb-28 px-6 overflow-hidden"
      >
        <ParticleField
          variant="threat"
          count={60}
          linkDistance={110}
          className="absolute inset-0 w-full h-full opacity-25"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
                aria-hidden="true"
              >
                <Icon name="shield-halved" className="text-red-400 text-sm" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-red-400">
                Cybersecurity
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-4 text-white"
            >
              Security Isn&apos;t
            </h1>
            <p className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-4 text-red-400">
              A Feature.
            </p>
            <p className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-10 text-gray-400">
              It&apos;s The Foundation.
            </p>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
              We engineer security into every system we build — and we assess,
              harden, and defend systems that already exist. Full-spectrum
              cybersecurity: offensive capabilities, defensive architecture, and
              24/7 security operations.
            </p>

            <AnswerBlock
              question="What is secure-by-design engineering?"
              className="mb-10"
            >
              Secure-by-design engineering means the authentication model, data
              boundaries, blast radius, and audit trail are decided during
              architecture, while they are still cheap to change — instead of
              being assessed after the system exists, when the same findings
              are expensive to act on. Audits still happen; they verify the
              design rather than substitute for one.
            </AnswerBlock>

            <div className="flex flex-wrap gap-4">
              <Link
                href={ASSESSMENT_HREF}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 transition-colors rounded-full font-semibold text-lg text-white inline-flex items-center gap-2"
              >
                <Icon name="clipboard-check" />
                Request Security Assessment
              </Link>
              <Link
                href={ASSESSMENT_HREF}
                className="px-8 py-4 border border-white/20 hover:bg-white/5 transition-colors rounded-full font-semibold text-lg text-white"
              >
                Talk To A Security Engineer
              </Link>
            </div>

            <nav
              className="flex flex-wrap gap-2 mt-10"
              aria-label="Jump to section"
            >
              <span className="text-xs text-gray-500 self-center mr-1">
                Jump to:
              </span>
              {SECURITY_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-1.5 text-xs border border-white/10 rounded-full text-gray-300 hover:border-red-500/40 hover:text-white transition-all"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <SocTicker />

      <main id="main-content">
        <div className="max-w-7xl mx-auto px-6 flex gap-10">
          <SecurityTOC />

          <div className="flex-1 min-w-0">
            {/* ── Services ─────────────────────────────────────────── */}
            <section
              id="services"
              aria-labelledby="services-heading"
              className="py-20"
            >
              <div className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3 block">
                  Full-Spectrum Cybersecurity
                </span>
                <h2
                  id="services-heading"
                  className="text-4xl md:text-5xl font-black text-white"
                >
                  Offensive. Defensive.
                  <br />
                  Operational.
                </h2>
                <p className="text-gray-400 mt-4 max-w-xl text-sm leading-relaxed">
                  Every capability is interconnected. Security isn&apos;t a
                  checklist — it&apos;s a continuous discipline woven into
                  architecture, development, and operations.
                </p>
              </div>

              <div className="soc-grid">
                {SECURITY_CAPABILITIES.map((capability) => (
                  <article key={capability.title} className="soc-cell">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${capability.iconWrap}`}
                        aria-hidden="true"
                      >
                        <Icon
                          name={capability.icon}
                          className={`text-lg ${capability.iconColor}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          {capability.title}
                        </h3>
                        {capability.badge && (
                          <span
                            className={`threat-badge ${capability.badgeClass ?? ""}`}
                          >
                            {capability.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {capability.body}
                    </p>
                    {capability.live && (
                      <p className="mt-4 flex items-center gap-2 text-xs text-red-400 font-mono">
                        <span
                          className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"
                          aria-hidden="true"
                        />
                        {capability.live}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* ── Live SOC ─────────────────────────────────────────── */}
            <section
              id="soc-dashboard"
              aria-labelledby="soc-heading"
              className="py-20 -mx-6 px-6 surface border-y border-red-900/10"
            >
              <div className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3 block">
                  Security-First Engineering
                </span>
                <h2 id="soc-heading" className="text-4xl font-black text-white">
                  Security Designed In.
                  <br />
                  Not Bolted On.
                </h2>
                <p className="text-gray-400 mt-3 max-w-xl text-sm leading-relaxed">
                  Every system we build has security requirements designed before
                  the first line of code. The live SOC panel below reflects real
                  monitoring capabilities we deploy for clients.
                </p>
              </div>

              <SocDashboard />
            </section>

            {/* ── Case studies ─────────────────────────────────────── */}
            <section
              id="case-studies"
              aria-labelledby="cases-heading"
              className="py-20"
            >
              <div className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3 block">
                  Proven Results
                </span>
                <h2 id="cases-heading" className="text-4xl font-black text-white">
                  Security Success Stories
                </h2>
                <p className="text-gray-400 mt-3 max-w-xl text-sm">
                  Real outcomes from organizations that trusted SoftwarePros with
                  their security posture. Details anonymized per NDA.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CASE_STUDIES.map((study) => (
                  <article
                    key={study.client}
                    className="case-card"
                    aria-label={study.aria}
                  >
                    <div
                      className={`h-2 bg-gradient-to-r ${study.bar}`}
                      aria-hidden="true"
                    />
                    <div className="p-7">
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${study.iconWrap}`}
                          aria-hidden="true"
                        >
                          <Icon name={study.icon} className={study.iconColor} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {study.client}
                          </p>
                          <p className="text-xs text-gray-500">{study.sector}</p>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                        Challenge
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        {study.challenge}
                      </p>

                      <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                        What We Did
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1 mb-5">
                        {study.actions.map((action) => (
                          <li key={action} className="flex items-start gap-2">
                            <Icon
                              name="check"
                              className="text-green-400 text-xs mt-1 shrink-0"
                            />
                            {action}
                          </li>
                        ))}
                      </ul>

                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                        {study.stats.map((stat) => (
                          <div key={stat.label} className="text-center">
                            <p
                              className={`text-xl font-black ${stat.accent ?? "text-white"}`}
                            >
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Testimonials ─────────────────────────────────────── */}
            <section
              id="testimonials"
              aria-labelledby="testimonials-heading"
              className="py-20 -mx-6 px-6 surface border-y border-white/5"
            >
              <div className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3 block">
                  Client Testimonials
                </span>
                <h2
                  id="testimonials-heading"
                  className="text-4xl font-black text-white"
                >
                  What Clients Say
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {TESTIMONIALS.map((testimonial) => (
                  <figure
                    key={testimonial.name}
                    className="testimonial-card"
                    aria-label={testimonial.aria}
                  >
                    <blockquote className="mb-6">
                      <div
                        className="flex gap-1 mb-4"
                        role="img"
                        aria-label="5 out of 5 stars"
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            name="star"
                            className="text-yellow-300 text-sm"
                          />
                        ))}
                      </div>
                      <p className="text-base text-gray-200 leading-relaxed italic">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <Image
                        src={testimonial.avatar}
                        alt={`Portrait of ${testimonial.name}, ${testimonial.role}`}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-400">{testimonial.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div
                className="glass rounded-2xl p-6 flex flex-wrap justify-around gap-6 text-center"
                aria-label="Aggregate security statistics"
              >
                {TRUST_STRIP.map((stat, i) => (
                  <div key={stat.label} className="flex gap-6">
                    {i > 0 && (
                      <div
                        className="w-px bg-white/10 hidden md:block"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p
                        className={`text-3xl font-black stat-count ${stat.accent ?? "text-white"}`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Compliance ───────────────────────────────────────── */}
            <section
              id="compliance"
              aria-labelledby="compliance-heading"
              className="py-20"
            >
              <div className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3 block">
                  Compliance &amp; Frameworks
                </span>
                <h2
                  id="compliance-heading"
                  className="text-4xl font-black text-white"
                >
                  We Know The Frameworks
                  <br />
                  That Govern Your Industry
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COMPLIANCE_FRAMEWORKS.map((framework) => (
                  <div key={framework.name} className="compliance-card">
                    <Icon
                      name={framework.icon}
                      className={`text-2xl mb-3 block ${framework.color}`}
                    />
                    <h3 className="font-bold text-white mb-1">
                      {framework.name}
                    </h3>
                    <p className="text-xs text-gray-400">{framework.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────── */}
            <FaqSection
              id="faq"
              title="Cybersecurity Questions"
              intro="What an assessment produces, how security gets built into development, and which compliance frameworks the work covers."
              className="py-24 -mx-6 px-6 border-t border-red-900/15"
              faqs={CYBERSECURITY_FAQS}
            />

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section
              id="cta"
              aria-labelledby="cta-heading"
              className="py-24 -mx-6 px-6 surface border-t border-red-900/15"
            >
              <div className="max-w-3xl mx-auto text-center">
                <div
                  className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-8"
                  aria-hidden="true"
                >
                  <Icon name="shield-halved" className="text-red-400 text-2xl" />
                </div>
                <h2
                  id="cta-heading"
                  className="text-4xl md:text-5xl font-black mb-5 text-white"
                >
                  Know Your Security Posture.
                </h2>
                <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Every organization has vulnerabilities. The question is whether
                  you find them before an attacker does. A SoftwarePros security
                  assessment gives you a clear, prioritized picture of where you
                  stand.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={ASSESSMENT_HREF}
                    className="px-10 py-4 bg-red-600 hover:bg-red-500 transition-colors rounded-full font-semibold text-lg text-white inline-flex items-center justify-center gap-2"
                  >
                    <Icon name="clipboard-check" />
                    Request Security Assessment
                  </Link>
                  <Link
                    href={ASSESSMENT_HREF}
                    className="px-10 py-4 border border-white/20 hover:bg-white/5 transition-colors rounded-full font-semibold text-lg text-white"
                  >
                    Talk To A Security Engineer
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                  No commitment required · We&apos;ll scope an assessment that
                  fits your environment
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="surface border-t border-red-900/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xl font-bold text-white">
            Software<span className="text-primary">.</span>Pros
          </span>
          <p className="text-sm text-gray-400">
            AI · Software Engineering · Cybersecurity · Cloud Infrastructure
          </p>
          <p className="text-xs text-gray-500">
            © 2025 SoftwarePros.org · All Rights Reserved
          </p>
        </div>
      </footer>

      <FloatingAIButton label="Request Assessment" href={ASSESSMENT_HREF} />
    </>
  );
}
