import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";

export function proxy(request: NextRequest): Response {
  if (!isAuthorized(request)) return unauthorizedResponse();
  return NextResponse.next();
}

// Scoped to the admin surface only: public pages, static assets and the
// public /api/leads endpoint never hit this code path.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
