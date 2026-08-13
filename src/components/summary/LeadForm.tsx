"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

const TIMELINES = [
  "ASAP (1-3 months)",
  "3-6 months",
  "6-12 months",
  "Planning phase",
] as const;

const FIELD_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors";

function apiErrorMessage(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const { error } = data as { error?: unknown };
    if (typeof error === "string" && error.length > 0) return error;
  }
  return "Could not send your summary. Please try again.";
}

/** Captures a lead against this summary via POST /api/leads. */
export function LeadForm({ summaryId }: { summaryId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [timeline, setTimeline] = useState("");
  // Honeypot — hidden from humans, irresistible to bots.
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          timeline,
          website,
          source: "summary",
          summaryId,
        }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(apiErrorMessage(data));
      }
      setState("sent");
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your summary. Please try again.",
      );
    }
  }

  if (state === "sent") {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-bold mb-3">Send This Summary</h3>
        <p
          role="status"
          className="text-sm text-emerald-300 flex items-start gap-2"
        >
          <Icon name="circle-check" className="mt-0.5 text-xs" />
          <span>Sent — a SoftwarePros architect will be in touch.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-bold mb-4">Send This Summary</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="lead-name" className="sr-only">
            Full name
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="sr-only">
            Work email
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work Email"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="lead-company" className="sr-only">
            Company name
          </label>
          <input
            id="lead-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company Name"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="lead-timeline" className="sr-only">
            Project timeline
          </label>
          <select
            id="lead-timeline"
            name="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className={`${FIELD_CLASS} text-gray-300`}
          >
            <option value="">Timeline</option>
            {TIMELINES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="lead-website">Website</label>
          <input
            id="lead-website"
            name="website"
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full py-3 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "sending" ? (
            <>
              Sending <Icon name="spinner" spin className="ml-1 text-xs" />
            </>
          ) : (
            <>
              Send My Project Summary{" "}
              <Icon name="arrow-right" className="ml-1 text-xs" />
            </>
          )}
        </button>

        {state === "error" && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
