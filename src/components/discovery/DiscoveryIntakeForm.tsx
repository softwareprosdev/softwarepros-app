"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/Icon";
import { ORG_EMAIL, ORG_PHONE_DISPLAY, ORG_PHONE_E164 } from "@/lib/org";
import { INDUSTRIES } from "@/lib/content";
import {
  FORM_FIELD_CLASS as FIELD,
  FORM_LABEL_CLASS as LABEL,
  TIMELINES,
} from "@/components/contact/ContactForm";

const PROJECT_TYPES = [
  "Website",
  "Web or mobile application",
  "Internal tool or automation",
  "AI feature or integration",
  "Not sure yet",
] as const;

const BUDGETS = [
  "Not sure yet",
  "Under $25k",
  "$25k – $100k",
  "$100k – $250k",
  "$250k+",
] as const;

type Status = "idle" | "sending" | "done" | "error";

/**
 * Builds the free-text `message` the Lead record stores. The Lead schema has
 * no dedicated columns for project type, industry, or budget — those only
 * matter for a discovery submission — so they're folded into one formatted
 * block instead of widening the schema for three fields read by a human.
 */
function buildMessage(fields: {
  projectType: string;
  industry: string;
  budget: string;
  description: string;
  goals: string;
}) {
  const lines = [
    `Project type: ${fields.projectType}`,
    `Industry: ${fields.industry || "Not specified"}`,
    `Budget: ${fields.budget}`,
    "",
    "What they're building:",
    fields.description,
  ];
  if (fields.goals.trim()) {
    lines.push("", "Key features / goals:", fields.goals);
  }
  return lines.join("\n");
}

/**
 * Replaces the old live AI conversation: a plain form that hands the same
 * information — what the client wants built, for whom, and on what budget
 * and timeline — straight to the engineering team as a Lead. No model call,
 * so nothing here depends on an API key or an AI provider being configured.
 */
export function DiscoveryIntakeForm({
  initialDescription,
}: {
  initialDescription?: string;
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
          message: buildMessage({
            projectType: value("projectType"),
            industry: value("industry"),
            budget: value("budget"),
            description: value("description"),
            goals: value("goals"),
          }),
          source: "discovery",
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
      <div className="text-center py-16 max-w-lg mx-auto" role="status">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6">
          <Icon name="circle-check" className="text-emerald-400 text-xl" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Got it — thank you.</h2>
        <p className="text-gray-400 text-sm mb-8">
          A Senior Software Architect reads every submission and will follow
          up by email, usually within one business day, with next steps for
          your project.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-3 border border-white/15 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          Submit another project
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl mx-auto">
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

      <div>
        <label htmlFor={`${id}-description`} className={LABEL}>
          What are you building?
        </label>
        <textarea
          id={`${id}-description`}
          name="description"
          required
          rows={5}
          maxLength={5000}
          defaultValue={initialDescription}
          placeholder="Describe the project, the problem it solves, and who uses it. The more detail, the less back-and-forth to get started."
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor={`${id}-projectType`} className={LABEL}>
            Project type
          </label>
          <select
            id={`${id}-projectType`}
            name="projectType"
            defaultValue={PROJECT_TYPES[0]}
            className={`${FIELD} appearance-none`}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-surface-elevated">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-industry`} className={LABEL}>
            Industry <span className="text-gray-600 normal-case">(optional)</span>
          </label>
          <select
            id={`${id}-industry`}
            name="industry"
            defaultValue=""
            className={`${FIELD} appearance-none`}
          >
            <option value="" className="bg-surface-elevated">
              Not listed / other
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i.slug} value={i.name} className="bg-surface-elevated">
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-budget`} className={LABEL}>
            Budget
          </label>
          <select
            id={`${id}-budget`}
            name="budget"
            defaultValue={BUDGETS[0]}
            className={`${FIELD} appearance-none`}
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b} className="bg-surface-elevated">
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-goals`} className={LABEL}>
          Must-have features or goals{" "}
          <span className="text-gray-600 normal-case">(optional)</span>
        </label>
        <textarea
          id={`${id}-goals`}
          name="goals"
          rows={3}
          maxLength={2000}
          placeholder="Anything specific it has to do, integrate with, or comply with."
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-white/10 pt-6">
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
            Company <span className="text-gray-600 normal-case">(optional)</span>
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
          "Send Project Details"
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Have documents or designs to share? Mention it above and email them to{" "}
        <a href={`mailto:${ORG_EMAIL}`} className="underline hover:text-gray-400">
          {ORG_EMAIL}
        </a>{" "}
        or call{" "}
        <a href={`tel:${ORG_PHONE_E164}`} className="underline hover:text-gray-400">
          {ORG_PHONE_DISPLAY}
        </a>
        . We use your details to reply to this enquiry only. See our{" "}
        <Link href="/legal/privacy" className="underline hover:text-gray-400">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
