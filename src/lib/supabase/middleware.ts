import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

/**
 * Refreshes the Supabase session cookie for one request and reports the
 * current user, if any.
 *
 * Must run before any auth decision in `proxy.ts`: a short-lived access
 * token that never gets refreshed here silently logs a client out mid-visit,
 * with no error to show them — they'd just start bouncing off `/login`.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    // Fails open on marketing pages, fails closed on anything gated — the
    // gate check in proxy.ts treats a null user as logged out either way.
    console.error(
      "[auth] Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
    return { response, user: null };
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.cookies.toString());
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // getUser() (not getSession()) — it re-validates against Supabase rather
  // than trusting the cookie's claims as-is, and refreshes an expired access
  // token via setAll above as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
