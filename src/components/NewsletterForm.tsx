"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "saving") return;
    setState("saving");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Subscription failed");
      setState("done");
      setMessage("You're subscribed.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Subscription failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-4">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address for the newsletter
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Newsletter"
        className="bg-transparent border-b border-white/20 py-2 text-sm focus:border-white outline-none w-48"
      />
      <button
        type="submit"
        disabled={state === "saving"}
        className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-50"
      >
        {state === "saving" ? "…" : "Subscribe"}
      </button>
      {message && (
        <span
          role="status"
          className={`text-xs ${state === "error" ? "text-red-400" : "text-emerald-400"}`}
        >
          {message}
        </span>
      )}
    </form>
  );
}
