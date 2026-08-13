"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

type ShareState = "idle" | "copied" | "failed";

const SHARE_LABEL: Record<ShareState, string> = {
  idle: "Share",
  copied: "Link copied",
  failed: "Copy failed",
};

/** Share (copy link) and Export PDF (print) for the project summary. */
export function SummaryActions() {
  const [share, setShare] = useState<ShareState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function onShare() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        ok = true;
      }
    } catch {
      ok = false;
    }
    setShare(ok ? "copied" : "failed");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setShare("idle"), 2500);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onShare}
        className="px-4 py-2 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <Icon
          name={share === "copied" ? "check" : "share-from-square"}
          className="text-xs"
        />
        <span>{SHARE_LABEL[share]}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {share === "copied"
          ? "Summary link copied to the clipboard"
          : share === "failed"
            ? "Could not copy the link. Copy it from the address bar."
            : ""}
      </span>
      <button
        type="button"
        onClick={() => window.print()}
        className="px-4 py-2 border border-white/10 rounded-full text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <Icon name="download" className="text-xs" />
        <span>Export PDF</span>
      </button>
    </div>
  );
}
