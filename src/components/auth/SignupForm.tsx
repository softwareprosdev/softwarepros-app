"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";

const FIELD_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors";

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "check-email" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");

    if (password.length < 8) {
      setState("error");
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}${redirectTo}`
              : undefined,
        },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        // Email confirmation is off for this project — already signed in.
        window.location.href = redirectTo;
        return;
      }
      setState("check-email");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not create your account.");
    }
  }

  if (state === "check-email") {
    return (
      <div className="glass rounded-2xl p-6">
        <p role="status" className="text-sm text-emerald-300 flex items-start gap-2">
          <Icon name="circle-check" className="mt-0.5 text-xs" />
          <span>
            Check {email} for a confirmation link, then come back and sign in.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="signup-name" className="sr-only">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="sr-only">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="sr-only">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className={FIELD_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "sending" ? (
            <>
              Creating account <Icon name="spinner" spin className="ml-1 text-xs" />
            </>
          ) : (
            "Create Account"
          )}
        </button>
        {state === "error" && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500 text-center pt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
