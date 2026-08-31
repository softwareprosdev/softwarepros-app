"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsInputToCents(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function apiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const { error } = data as { error?: unknown };
    if (typeof error === "string" && error.length > 0) return error;
  }
  return fallback;
}

/**
 * The human-review action itself. Pre-filled with the AI's draft numbers —
 * an architect can approve as-is or adjust either figure before it ever
 * reaches the client.
 */
export function ContractApproveForm({
  contractId,
  defaultTotalCents,
  defaultDepositCents,
}: {
  contractId: string;
  defaultTotalCents: number;
  defaultDepositCents: number;
}) {
  const [total, setTotal] = useState(centsToDollarsInput(defaultTotalCents));
  const [deposit, setDeposit] = useState(centsToDollarsInput(defaultDepositCents));
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onApprove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const totalCents = dollarsInputToCents(total);
    const depositCents = dollarsInputToCents(deposit);
    if (totalCents == null || depositCents == null) {
      setState("error");
      setError("Enter valid amounts.");
      return;
    }

    setState("sending");
    setError("");
    try {
      const res = await fetch(`/api/admin/contracts/${contractId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalCents, depositCents }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Could not approve."));
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not approve.");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="text-sm text-emerald-300 flex items-center gap-2">
        <Icon name="circle-check" className="text-xs" /> Sent to client
      </p>
    );
  }

  return (
    <form onSubmit={onApprove} className="flex flex-wrap items-end gap-3">
      <div>
        <label
          htmlFor={`total-${contractId}`}
          className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1"
        >
          Total (USD)
        </label>
        <input
          id={`total-${contractId}`}
          type="number"
          min="0"
          step="0.01"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <div>
        <label
          htmlFor={`deposit-${contractId}`}
          className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1"
        >
          Deposit (USD)
        </label>
        <input
          id={`deposit-${contractId}`}
          type="number"
          min="0"
          step="0.01"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <button
        type="submit"
        disabled={state === "sending"}
        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {state === "sending" ? "Approving…" : "Approve & Send"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-xs text-red-400 w-full">
          {error}
        </p>
      )}
    </form>
  );
}
