"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";

const FIELD_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      // Full navigation, not client-side routing — proxy.ts's session refresh
      // needs to see the fresh cookie on the very next request.
      window.location.href = redirectTo;
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error ? err.message : "Could not sign in. Check your details.",
      );
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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
              Signing in <Icon name="spinner" spin className="ml-1 text-xs" />
            </>
          ) : (
            "Sign In"
          )}
        </button>
        {state === "error" && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500 text-center pt-1">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
