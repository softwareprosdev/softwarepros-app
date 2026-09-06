import "server-only";

/**
 * Reads a JSON request body with a hard byte ceiling.
 *
 * `request.json()` buffers the whole body before any validation runs, so a
 * Zod schema is no defence against the request that never reaches it: an
 * unauthenticated caller can post an arbitrarily large body to a public
 * endpoint and have the server hold all of it in memory first. The forms
 * these routes serve send well under a kilobyte.
 *
 * Content-Length is checked first because it costs nothing when it is present
 * and honest, and the read is capped anyway for the chunked case where it is
 * absent or lying.
 */
export async function readJson(
  request: Request,
  maxBytes: number,
): Promise<unknown | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;

  const body = request.body;
  if (!body) return null;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      // Cancelled rather than drained: there is no reason to keep receiving a
      // body that is already too large to be accepted.
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  // Joined before decoding rather than decoded per chunk: a multi-byte
  // character can straddle a chunk boundary, and decoding the halves
  // separately corrupts it.
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(merged));
  } catch {
    return null;
  }
}
