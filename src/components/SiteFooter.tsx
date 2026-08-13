import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ORG_PROFILES } from "@/lib/org";
import { routesInGroup } from "@/lib/routes";

/**
 * Solutions and Industries are deep links into the two hub pages; Company and
 * Legal are generated from the shared route table so a new policy page cannot
 * ship without appearing here. See `lib/routes.ts`.
 */
const CURATED = [
  {
    title: "Solutions",
    links: [
      { href: "/solutions#ai", label: "AI Development" },
      { href: "/solutions/cybersecurity", label: "Cybersecurity" },
      { href: "/solutions#security", label: "Cloud" },
      { href: "/solutions", label: "All 20 Disciplines" },
    ],
  },
  {
    title: "Industries",
    links: [
      { href: "/industries#healthcare", label: "Healthcare" },
      { href: "/industries#finance", label: "Finance" },
      { href: "/industries#manufacturing", label: "Manufacturing" },
      { href: "/industries", label: "All 15 Industries" },
    ],
  },
];

export function SiteFooter() {
  const columns = [
    ...CURATED,
    {
      title: "Company",
      links: routesInGroup("company").map((route) => ({
        href: route.path,
        label: route.title,
      })),
    },
    {
      title: "Legal",
      links: routesInGroup("legal").map((route) => ({
        href: route.path,
        label: route.title,
      })),
    },
  ];

  return (
    <footer className="bg-surface border-t border-white/5 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-12">
          <div className="max-w-xs">
            <span className="text-3xl font-bold tracking-tight text-white">
              Software<span className="text-primary">.</span>Pros
            </span>
            <p className="text-gray-500 mt-4">
              AI — Software — Cybersecurity — Cloud
            </p>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Engineering intelligent technology systems for organizations
              replacing complexity with automation, security, and scale.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="font-bold mb-6">{col.title}</h2>
                <ul className="space-y-4 text-sm text-gray-400">
                  {col.links.map((link) => (
                    <li key={`${col.title}-${link.label}`}>
                      <Link href={link.href} className="hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} SoftwarePros.org. All rights
              reserved.
            </p>
            {/* Rendered only once real profile URLs exist — see `lib/org.ts`. */}
            {ORG_PROFILES.length > 0 && (
              <ul className="flex gap-4 text-gray-400">
                {ORG_PROFILES.map((profile) => (
                  <li key={profile.label}>
                    <a
                      href={profile.href}
                      aria-label={profile.label}
                      rel="me noopener noreferrer"
                      target="_blank"
                      className="hover:text-white"
                    >
                      <Icon name={profile.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
