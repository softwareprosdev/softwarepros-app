import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session-user";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "application/xml",
  "text/xml",
]);

/**
 * Accepts discovery attachments. Images and PDFs are stored base64 and handed
 * to Claude natively; text-ish files are stored as extracted text.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "upload"), {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return tooManyRequests(limit, "Too many uploads. Try again shortly.");
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const sessionPublicId = form.get("sessionId");
  const file = form.get("file");

  if (typeof sessionPublicId !== "string" || !(file instanceof File)) {
    return Response.json(
      { error: "A session id and a file are required." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Files must be 10 MB or smaller." },
      { status: 413 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const session = await prisma.discoverySession.findUnique({
    where: { publicId: sessionPublicId },
    select: { id: true, userId: true },
  });
  if (!session || session.userId !== user.id) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isPdf = file.type === "application/pdf";
  const isText =
    TEXT_TYPES.has(file.type) ||
    /\.(txt|md|csv|json|ya?ml|log|tsv)$/i.test(file.name);

  if (!isImage && !isPdf && !isText) {
    return Response.json(
      {
        error:
          "Unsupported file type. Upload an image, a PDF, or a text document (txt, md, csv, json).",
      },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content =
    isImage || isPdf
      ? buffer.toString("base64")
      : buffer.toString("utf8").slice(0, 200_000);

  const attachment = await prisma.attachment.create({
    data: {
      sessionId: session.id,
      kind: isImage ? "IMAGE" : "DOCUMENT",
      filename: file.name,
      mimeType: file.type || (isPdf ? "application/pdf" : "text/plain"),
      sizeBytes: file.size,
      content,
    },
    select: { id: true, filename: true, kind: true, mimeType: true, sizeBytes: true },
  });

  return Response.json({ attachment }, { status: 201 });
}
