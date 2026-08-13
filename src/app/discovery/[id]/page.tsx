import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { readOwnerToken } from "@/lib/session-owner";
import { DiscoveryWorkspace } from "@/components/discovery/DiscoveryWorkspace";
import type { SessionAnalysis, ChatMessage } from "@/components/discovery/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Discovery Center",
  description:
    "Describe your business problem and the SoftwarePros AI Architect will turn it into an engineer-ready system definition.",
  // A session URL is a capability link to one visitor's conversation.
  robots: { index: false, follow: false },
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function DiscoverySessionPage({
  params,
  searchParams,
}: PageProps<"/discovery/[id]">) {
  const { id } = await params;
  const { mode } = await searchParams;

  const session = await prisma.discoverySession.findUnique({
    where: { publicId: id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      summaries: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!session) notFound();

  // Scoped to this browser's owner token — the sidebar must never surface
  // another visitor's conversations.
  const ownerToken = await readOwnerToken();
  const recent = ownerToken
    ? await prisma.discoverySession.findMany({
        where: { ownerToken, messages: { some: {} } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { publicId: true, title: true, industry: true, updatedAt: true },
      })
    : [];

  const analysis: SessionAnalysis = {
    industry: session.industry,
    scale: session.scale,
    complexity: session.complexity,
    currentState: session.currentState,
    clarityScore: session.clarityScore,
    requirementsFound: session.requirementsFound,
    requirementsTarget: session.requirementsTarget,
    recommendedPlatform: session.recommendedPlatform,
    modules: toStringArray(session.modules),
    unclearModules: toStringArray(session.unclearModules),
    clarifications: toStringArray(session.clarifications),
    suggestions: toStringArray(session.suggestions),
  };

  const messages: ChatMessage[] = session.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <DiscoveryWorkspace
      sessionId={session.publicId}
      title={session.title}
      initialMessages={messages}
      initialAnalysis={analysis}
      initialAttachments={session.attachments.map((a) => ({
        id: a.id,
        filename: a.filename,
        kind: a.kind,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
      }))}
      recentSessions={recent.map((s) => ({
        publicId: s.publicId,
        title: s.title,
        industry: s.industry,
        updatedAt: s.updatedAt.toISOString(),
      }))}
      existingSummaryId={session.summaries[0]?.publicId ?? null}
      initialMode={mode === "upload" ? "upload" : "chat"}
    />
  );
}
