"use client";

import Link from "next/link";

export function FloatingAIButton({
  label = "Ask SoftwarePros AI",
  href = "/discovery",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="no-print fixed bottom-8 right-8 z-40 px-6 py-3 bg-blue-600 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
    >
      <span
        className="w-2 h-2 bg-white rounded-full animate-pulse"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
