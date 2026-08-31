import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null; name: string | null };

/**
 * The logged-in client for this request, or null if unauthenticated.
 *
 * Safe to call from any Server Component or Route Handler under a path
 * `proxy.ts` already gates — this never itself redirects or 401s, it just
 * reports who (if anyone) is signed in, so a route can also enforce
 * *ownership* (e.g. "this session belongs to this user") on top of the
 * proxy's plain "is anyone signed in" check.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    // Set at signup (see components/auth/SignupForm.tsx). Falls back to the
    // email locally rather than leaving a contract's "Client:" line blank.
    name:
      typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : null,
  };
}
