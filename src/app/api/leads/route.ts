import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

const LeadRequest = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().max(320),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  timeline: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(5_000).optional().or(z.literal("")),
  source: z
    .enum(["summary", "contact", "assessment", "schedule", "discovery"])
    .default("contact"),
  sessionId: z.string().optional(),
  summaryId: z.string().optional(),
  // Honeypot: real users never fill this in.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "leads"), {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many submissions. Try again shortly.");
  }

  const parsed = LeadRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.website) {
    // Silently accept and drop — don't tell a bot it was caught.
    return Response.json({ ok: true }, { status: 201 });
  }

  const session = data.sessionId
    ? await prisma.discoverySession.findUnique({
        where: { publicId: data.sessionId },
        select: { id: true },
      })
    : null;

  const summary = data.summaryId
    ? await prisma.projectSummary.findUnique({
        where: { publicId: data.summaryId },
        select: { id: true },
      })
    : null;

  await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company || null,
      phone: data.phone || null,
      timeline: data.timeline || null,
      message: data.message || null,
      source: data.source,
      sessionId: session?.id ?? null,
      summaryId: summary?.id ?? null,
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}
