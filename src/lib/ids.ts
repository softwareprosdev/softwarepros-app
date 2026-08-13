const ALPHABET = "0123456789abcdefghijkmnpqrstuvwxyz"; // no l/o — avoids misreads

/**
 * Short, unguessable, URL-safe id. Used for session and summary links, which
 * are shared by URL and therefore act as bearer tokens.
 */
export function publicId(length = 14) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
