"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { SECURITY_SECTIONS } from "@/lib/security-content";

export function SecurityTOC() {
  const [active, setActive] = useState(SECURITY_SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const section of SECURITY_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className="hidden xl:block w-52 shrink-0 pt-20 sticky top-20 h-fit"
      aria-label="On-page navigation"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-3">
        On This Page
      </p>
      <nav aria-label="Cybersecurity page sections">
        <ul className="space-y-1">
          {SECURITY_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`toc-link ${active === section.id ? "active" : ""}`}
                aria-current={active === section.id ? "true" : undefined}
              >
                <Icon name={section.icon} className="w-4 text-xs" />
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 mx-3 surface border border-red-900/25 rounded-xl p-4">
        <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">
          Avg. Client Score
        </p>
        <p className="text-3xl font-black text-green-400 stat-count">
          91<span className="text-lg text-gray-500">/100</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">After SoftwarePros hardening</p>
        <div className="h-1.5 bg-white/5 rounded-full mt-3">
          <div
            className="h-full w-[91%] bg-gradient-to-r from-green-600 to-emerald-400 rounded-full"
            role="progressbar"
            aria-valuenow={91}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="91 out of 100 security score"
          />
        </div>
      </div>

      <div className="mt-4 mx-3">
        <Link
          href="/contact?intent=assessment"
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-xs font-semibold text-white"
        >
          <Icon name="clipboard-check" />
          Free Assessment
        </Link>
      </div>
    </aside>
  );
}
