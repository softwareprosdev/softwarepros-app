"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/content";
import { Icon } from "@/components/Icon";
import { useVoiceModal } from "@/components/VoiceModalProvider";

export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`${className} font-bold tracking-tight text-white`}
      aria-label="SoftwarePros home"
    >
      Software<span className="text-primary">.</span>Pros
    </Link>
  );
}

export function SiteNav({
  variant = "default",
}: {
  variant?: "default" | "security";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { open: openVoice } = useVoiceModal();
  const isSecurity = variant === "security";

  return (
    <nav
      aria-label="Site navigation"
      className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md ${
        isSecurity
          ? "bg-ink/95 border-b border-red-900/20"
          : "bg-surface/80 border-b border-white/5"
      }`}
    >
      <div className="flex items-center gap-8">
        <Wordmark />
        <div className="hidden lg:flex gap-6 text-sm font-medium text-gray-300">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-white border-b border-white/30"
                    : "nav-link relative hover:text-white transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isSecurity && (
          <Link
            href="/contact?intent=assessment"
            className="hidden sm:block px-5 py-2 border border-red-500/50 rounded-full text-xs font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Request Security Assessment
          </Link>
        )}
        <Link
          href="/discovery"
          className={`px-6 py-2.5 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity ${
            isSecurity
              ? "bg-gradient-to-r from-red-700 to-red-600"
              : "bg-gradient-to-r from-blue-600 to-indigo-600"
          }`}
        >
          Start A Project
        </Link>
        {!isSecurity && (
          <button
            type="button"
            onClick={openVoice}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-white/15 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:border-white/30 transition-all"
          >
            <Icon name="microphone-lines" className="text-cyan-400" />
            <span>Talk to AI</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="lg:hidden w-9 h-9 rounded-full border border-white/15 text-gray-300"
        >
          <Icon name={open ? "xmark" : "bars"} />
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 lg:hidden bg-surface/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-gray-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/solutions/cybersecurity"
            onClick={() => setOpen(false)}
            className="text-sm text-red-300"
          >
            Cybersecurity
          </Link>
        </div>
      )}
    </nav>
  );
}
