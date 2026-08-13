"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/Icon";

export type LeadSource = "summary" | "contact" | "assessment" | "schedule";

const TIMELINES = [
  "Not sure yet",
  "Immediately",
  "1–3 months",
  "3–6 months",
  "6+ months",
] as const;

type Status = "idle" | "sending" | "done" | "error";

const FIELD =
  "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-primary/60 transition-colors";
const LABEL =
  "block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2";

export function ContactForm({
  source,
  sessionId,
  summaryId,
  submitLabel = "Send Message",
  messageLabel = "Project details",
  messagePlaceholder = "What are you building, what's broken, or what you need to decide.",
}: {
  source: LeadSource;
  sessionId?: string;
  summaryId?: string;
  submitLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    // Captured before the first await — React nulls `currentTarget` afterwards.
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          company: value("company"),
          phone: value("phone"),
          timeline: value("timeline"),
          message: value("message"),
          source,
          sessionId,
          summaryId,
          website: value("website"),
        }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const reason =
          body && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : "Something went wrong. Please try again.";
        throw new Error(reason);
      }
      form.reset();
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-10" role="status">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6">
          <Icon name="circle-check" className="text-emerald-400 text-xl" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Message received.</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
          An engineer — not a sales rep — reads every submission. Expect a reply
          within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-3 border border-white/15 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — visually and programmatically hidden from real users. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor={`${id}-name`} className={LABEL}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            placeholder="Jordan Reyes"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={LABEL}>
            Work email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            placeholder="jordan@company.com"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor={`${id}-company`} className={LABEL}>
            Company
          </label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            maxLength={200}
            autoComplete="organization"
            placeholder="Acme Logistics"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={LABEL}>
            Phone <span className="text-gray-600 normal-case">(optional)</span>
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            placeholder="+1 555 018 2244"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-timeline`} className={LABEL}>
          Timeline
        </label>
        <select
          id={`${id}-timeline`}
          name="timeline"
          defaultValue={TIMELINES[0]}
          className={`${FIELD} appearance-none`}
        >
          {TIMELINES.map((t) => (
            <option key={t} value={t} className="bg-surface-elevated">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={LABEL}>
          {messageLabel}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          maxLength={5000}
          placeholder={messagePlaceholder}
          className={`${FIELD} resize-y`}
        />
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <Icon name="triangle-exclamation" className="mt-0.5" />
          <span>{error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <span className="inline-flex items-center gap-2">
            <Icon name="spinner" spin />
            Sending…
          </span>
        ) : (
          submitLabel
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        We use your details to reply to this enquiry only. See our{" "}
        <Link href="/legal/privacy" className="underline hover:text-gray-400">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
