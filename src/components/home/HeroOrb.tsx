"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";

export function HeroOrb() {
  return (
    <div className="flex flex-col items-center gap-16">
      <Link
        href="/discovery"
        aria-label="Tell us what you're building"
        className="relative w-80 h-80 flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="z-10 text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-2xl flex items-center justify-center group-hover:border-cyan-400/40 transition-colors">
            <Icon name="comments" className="text-4xl text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            What Are You Trying To Build?
          </h2>
          <p className="text-xs text-gray-500">Tell us in your own words</p>
        </div>
        <div className="absolute inset-0 border border-white/5 rounded-full scale-125 animate-pulse-ring" />
        <div className="absolute inset-0 border border-white/5 rounded-full scale-150 animate-pulse-ring [animation-delay:0.5s]" />
      </Link>

      <Link
        href="/discovery"
        className="flex items-center gap-4 cursor-pointer group"
      >
        <span className="relative w-10 h-10 flex items-center justify-center">
          <span className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-ring" />
          <Icon name="keyboard" className="text-primary" />
        </span>
        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
          Tell Us What You Need
        </span>
      </Link>
    </div>
  );
}
