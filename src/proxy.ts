import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Page routes a signed-in client account is required for. `/discovery` so
 * one visitor's AI conversation is never reachable by another; `/contract`
 * so a payable, signable contract is never reachable by anyone but the
 * client it was drafted for (ownership itself is still re-checked in each
 * route/page — this only gates "is anyone signed in at all").
 */
const AUTH_REQUIRED_PAGE_PREFIXES = ["/discovery", "/contract", "/account"];

/**
 * API routes requiring the same. `/api/webhooks` is deliberately absent —
 * Stripe calls it directly and it authenticates by signature, not session.
 */
const AUTH_REQUIRED_API_PREFIXES = [
  "/api/sessions",
  "/api/chat",
  "/api/summary",
  "/api/upload",
  "/api/contracts",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest): Promise<Response> {
  const { pathname } = request.nextUrl;

  // Internal staff surface: unchanged HTTP Basic auth, never touches
  // Supabase — an outage or misconfiguration on the client-auth side must
  // never lock staff out of /admin.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAuthorized(request)) return unauthorizedResponse();
    return NextResponse.next();
  }

  // Every other request refreshes the Supabase session cookie first, so a
  // token nearing expiry renews before a gate check below can wrongly treat
  // a still-valid client as logged out.
  const { response, user } = await updateSession(request);

  const needsAuth =
    matchesPrefix(pathname, AUTH_REQUIRED_PAGE_PREFIXES) ||
    matchesPrefix(pathname, AUTH_REQUIRED_API_PREFIXES);

  if (needsAuth && !user) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Sign in required." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/discovery/:path*",
    "/contract/:path*",
    "/api/sessions/:path*",
    "/api/chat/:path*",
    "/api/summary/:path*",
    "/api/upload/:path*",
    "/api/contracts/:path*",
    // Session refresh also runs on every other route (marketing pages
    // included) so a client's login never silently expires between visits —
    // everything except static assets and generated image routes.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
