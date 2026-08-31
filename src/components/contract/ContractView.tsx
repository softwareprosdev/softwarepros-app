"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

const FIELD_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors";

function apiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const { error } = data as { error?: unknown };
    if (typeof error === "string" && error.length > 0) return error;
  }
  return fallback;
}

export function ContractView({
  contractId,
  bodyText,
  status,
  signerNameDefault,
  paid,
}: {
  contractId: string;
  bodyText: string;
  status: "SENT" | "SIGNED";
  signerNameDefault: string;
  paid: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [signerName, setSignerName] = useState(signerNameDefault);
  const [agreed, setAgreed] = useState(false);
  const [signState, setSignState] = useState<"idle" | "signing" | "error">("idle");
  const [signError, setSignError] = useState("");
  const [payState, setPayState] = useState<"idle" | "starting" | "error">("idle");
  const [payError, setPayError] = useState("");

  async function onSign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signState === "signing" || !agreed) return;
    setSignState("signing");
    setSignError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Could not sign. Try again."));
      setCurrentStatus("SIGNED");
      setSignState("idle");
    } catch (err) {
      setSignState("error");
      setSignError(err instanceof Error ? err.message : "Could not sign. Try again.");
    }
  }

  async function onPay() {
    if (payState === "starting") return;
    setPayState("starting");
    setPayError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}/checkout`, {
        method: "POST",
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "Could not start checkout. Try again."));
      }
      const { url } = data as { url: string };
      window.location.href = url;
    } catch (err) {
      setPayState("error");
      setPayError(
        err instanceof Error ? err.message : "Could not start checkout. Try again.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
          {bodyText}
        </pre>
      </div>

      {currentStatus === "SENT" && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-bold mb-4">Sign This Agreement</h2>
          <form onSubmit={onSign} className="space-y-3">
            <div>
              <label htmlFor="signer-name" className="sr-only">
                Type your full legal name
              </label>
              <input
                id="signer-name"
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Type your full legal name"
                className={FIELD_CLASS}
              />
            </div>
            <label className="flex items-start gap-2.5 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I have read the agreement above and I am electronically signing it
                as {signerName || "the client named above"}.
              </span>
            </label>
            <button
              type="submit"
              disabled={signState === "signing" || !agreed}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signState === "signing" ? (
                <>
                  Signing <Icon name="spinner" spin className="ml-1 text-xs" />
                </>
              ) : (
                "Sign Agreement"
              )}
            </button>
            {signState === "error" && (
              <p role="alert" className="text-xs text-red-400">
                {signError}
              </p>
            )}
          </form>
        </div>
      )}

      {currentStatus === "SIGNED" && (
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-emerald-300 flex items-start gap-2 mb-4">
            <Icon name="circle-check" className="mt-0.5 text-xs" />
            <span>Signed. Next: pay the deposit to start work.</span>
          </p>
          {paid ? (
            <p className="text-sm text-emerald-300 flex items-start gap-2">
              <Icon name="circle-check" className="mt-0.5 text-xs" />
              <span>Deposit received — a SoftwarePros architect will be in touch.</span>
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={onPay}
                disabled={payState === "starting"}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {payState === "starting" ? (
                  <>
                    Starting checkout <Icon name="spinner" spin className="ml-1 text-xs" />
                  </>
                ) : (
                  "Pay Deposit"
                )}
              </button>
              {payState === "error" && (
                <p role="alert" className="text-xs text-red-400 mt-2">
                  {payError}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
