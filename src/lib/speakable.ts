/**
 * Strips Markdown before text is sent to be spoken.
 *
 * Claude answers in Markdown — `**multi-tenant contract lifecycle SaaS**`,
 * `- ` bullets, numbered lists — because the chat transcript renders it. That
 * text was being handed to ElevenLabs verbatim, which reads the punctuation
 * as part of the sentence and bills for every asterisk.
 *
 * Deliberately lossy: this is for the ear, not the eye. Structure that only
 * means something visually is dropped rather than described.
 */
export function speakableText(markdown: string): string {
  return (
    markdown
      // A code block read aloud is noise. Say that it exists and move on.
      .replace(/```[\s\S]*?```/g, ". (code omitted) ")
      .replace(/`([^`]+)`/g, "$1")
      // Headings: keep the words, lose the hashes.
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2")
      // Bullets and numbering after emphasis, so `- **Billing**` has already
      // become `- Billing` by the time the marker is removed.
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Table pipes and horizontal rules read as gibberish.
      .replace(/^\s*\|.*\|\s*$/gm, "")
      .replace(/^\s*([-*_]\s*){3,}$/gm, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}
