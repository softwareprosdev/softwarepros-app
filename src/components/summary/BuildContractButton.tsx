"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

function apiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const { error } = data as { error?: unknown };
    if (typeof error === "string" && error.length > 0) return error;
  }
  return fallback;
}

/**
 * Drafts a contract from this summary and sends the client to it. The
 * contract starts out pending a Senior Software Architect's review — this
 * button does not itself put any price in front of the client.
 */
export function BuildContractButton({ summaryId }: { summaryId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onClick() {
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "Could not start your contract."));
      }
      const { publicId } = data as { publicId: string };
      window.location.href = `/contract/${publicId}`;
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not start your contract.");
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-bold mb-2">Ready To Start?</h3>
      <p className="text-xs text-gray-500 mb-4">
        We&apos;ll draft pricing and a contract from this summary. A Senior Software
        Architect reviews it before you see any numbers.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={state === "sending"}
        className="w-full py-3 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "sending" ? (
          <>
            Drafting <Icon name="spinner" spin className="ml-1 text-xs" />
          </>
        ) : (
          <>
            Get Pricing & Contract <Icon name="arrow-right" className="ml-1 text-xs" />
          </>
        )}
      </button>
      {state === "error" && (
        <p role="alert" className="text-xs text-red-400 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
