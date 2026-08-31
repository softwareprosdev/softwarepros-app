import "server-only";
import { cookies } from "next/headers";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";

/**
 * Supabase client for Server Components and Route Handlers.
 *
 * Read-only by design: `setAll` is intentionally omitted. Session refresh
 * happens once, up front, in `proxy.ts` (via `lib/supabase/middleware.ts`)
 * — every request this app serves passes through it first, so by the time a
 * Server Component or Route Handler runs, cookies are already current. A
 * Server Component cannot write cookies at all, and a second, redundant
 * refresh attempt here would only risk racing the one the proxy already did.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(cookieStore.toString());
      },
    },
  });
}
