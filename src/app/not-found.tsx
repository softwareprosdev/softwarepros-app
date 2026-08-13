import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "That page does not exist on SoftwarePros.org.",
};

/**
 * Root 404. Next routes every unmatched URL here, so this is also the
 * landing spot for expired capability links (`/discovery/{id}`) that no
 * longer resolve — hence the discovery CTA rather than a bare "go home".
 */
/** `.service-card` drives its hover treatment off these; sky is the site default. */
const ACCENT = {
  "--accent": "#0ea5e9",
  "--accent-rgb": "14, 165, 233",
} as React.CSSProperties;

const DESTINATIONS = [
  {
    href: "/solutions",
    icon: "layer-group",
    label: "Solutions",
    blurb: "All 20 engineering disciplines, grouped by category.",
  },
  {
    href: "/industries",
    icon: "industry",
    label: "Industries",
    blurb: "The 15 sectors we already speak the language of.",
  },
  {
    href: "/solutions/cybersecurity",
    icon: "shield-halved",
    label: "Cybersecurity",
    blurb: "Threat detection, compliance, and incident response.",
  },
  {
    href: "/contact",
    icon: "envelope",
    label: "Contact",
    blurb: "Talk to a Senior Software Architect directly.",
  },
];

export default function NotFound() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main">
        <section className="pt-40 pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-primary mb-4 block">
              Error 404
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
              This Route
              <br />
              Doesn&apos;t Resolve
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              The page you asked for isn&apos;t here. If you followed a
              discovery or project-summary link, it may have expired — those
              URLs are single-use capability links, not permanent addresses.
              Start a new session and the AI Architect will pick the thread back
              up.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link
                href="/discovery"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity text-center"
              >
                Start A Discovery Session
              </Link>
              <Link
                href="/"
                className="px-8 py-4 border border-white/10 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-all text-center"
              >
                Back To Home
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-32 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-6 pt-10 border-t border-white/5">
              Or try one of these
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {DESTINATIONS.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    style={ACCENT}
                    className="service-card rounded-2xl p-6 flex items-start gap-4 h-full"
                  >
                    <Icon
                      name={d.icon}
                      className="text-primary text-lg mt-0.5 shrink-0"
                    />
                    <span>
                      <span className="block font-semibold mb-1">
                        {d.label}
                      </span>
                      <span className="block text-sm text-gray-400 leading-relaxed">
                        {d.blurb}
                      </span>
                    </span>
                    <Icon
                      name="arrow-right"
                      className="service-arrow text-gray-600 ml-auto mt-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
