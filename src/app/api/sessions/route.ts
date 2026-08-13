import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicId } from "@/lib/ids";
import { ensureOwnerToken, readOwnerToken } from "@/lib/session-owner";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { logDbFailure } from "@/lib/db-errors";

const CreateSession = z.object({
  message: z.string().trim().max(20_000).optional(),
});

/** Creates a discovery session, optionally seeded with a first client message. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "sessions"), {
    limit: 15,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many new sessions. Try again shortly.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = CreateSession.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = parsed.data.message?.trim();
  const ownerToken = await ensureOwnerToken();

  try {
    const session = await prisma.discoverySession.create({
      data: {
        publicId: publicId(),
        ownerToken,
        title: message ? message.slice(0, 60) : "New Discovery",
        messages: message
          ? { create: [{ role: "USER", content: message }] }
          : undefined,
      },
      select: { publicId: true },
    });

    return NextResponse.json({ publicId: session.publicId }, { status: 201 });
  } catch (error) {
    // Previously this threw straight through to a bare 500, so the client had
    // nothing to distinguish "the database is down" from "you are offline"
    // and the server logged an empty Prisma error. Both ends now say which.
    const failure = logDbFailure("createDiscoverySession", error);
    return NextResponse.json(
      {
        error:
          "The discovery service is temporarily unavailable. This is on our side, not yours.",
        code: failure.code,
      },
      { status: 503 },
    );
  }
}

/**
 * Recent sessions for the discovery sidebar — scoped to the calling browser.
 * Without the owner filter this would expose every visitor's conversations.
 */
export async function GET() {
  const ownerToken = await readOwnerToken();
  if (!ownerToken) return NextResponse.json({ sessions: [] });

  try {
    return NextResponse.json({ sessions: await recentSessions(ownerToken) });
  } catch (error) {
    // The sidebar's session history is a convenience, not the feature. If the
    // database is unreachable, an empty list degrades gracefully; failing the
    // request would take the whole workspace down with it.
    logDbFailure("listRecentSessions", error);
    return NextResponse.json({ sessions: [] });
  }
}

function recentSessions(ownerToken: string) {
  return prisma.discoverySession.findMany({
    where: { ownerToken },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: {
      publicId: true,
      title: true,
      industry: true,
      updatedAt: true,
    },
  });
}
