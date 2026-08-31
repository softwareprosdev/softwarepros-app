"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components — used only by the signup/login
 * forms, which call `auth.signUp` / `auth.signInWithPassword` directly from
 * the browser against Supabase's own API (never through our server), then
 * let `proxy.ts`'s session refresh pick up the resulting cookie on the next
 * request.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return createBrowserClient(url, publishableKey);
}
