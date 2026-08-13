import "server-only";
import { cookies } from "next/headers";
import { publicId } from "@/lib/ids";
import { OWNER_COOKIE_NAME } from "@/lib/cookie-names";

export const OWNER_COOKIE = OWNER_COOKIE_NAME;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matching the retention notice

/**
 * Reads the caller's owner token. Returns null when the visitor has none yet.
 * Safe to call from a Server Component (read-only).
 */
export async function readOwnerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(OWNER_COOKIE)?.value ?? null;
}

/**
 * Reads the owner token, minting and setting one if absent. Only valid inside a
 * Route Handler or Server Action — Server Components cannot set cookies.
 */
export async function ensureOwnerToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(OWNER_COOKIE)?.value;
  if (existing) return existing;

  const token = publicId(32);
  store.set(OWNER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return token;
}
