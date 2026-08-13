import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The shared social share card ("banner") renderer.
 *
 * One 1200×630 PNG design, parameterised, so every page can declare its own
 * card without a second design drifting away from the first. 1200×630 is the
 * size Facebook, LinkedIn, iMessage, WhatsApp, Telegram, Slack and X all
 * render as a *large* card; anything under 600×315 downgrades to a thumbnail
 * strip, and non-2:1-ish ratios get centre-cropped unpredictably.
 *
 * Constraints this design is built around:
 *
 * - **Under 600 KB.** WhatsApp silently drops previews for large images and
 *   iMessage times out on them. A flat-colour PNG at this size lands ~120 KB.
 * - **No transparency.** iMessage and several Android SMS clients composite
 *   transparent PNGs onto white, which would erase white text.
 * - **Nothing important in the outer ~6%.** Facebook and iMessage crop edges
 *   at some breakpoints, so the padding here is safe area, not decoration.
 * - **Text large enough to survive a phone-width thumbnail.** The title is
 *   read at roughly a third of this size in a chat list.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Satori cannot read `woff2` (which is all `next/font` emits), so the two
 * weights the card uses are vendored as `ttf` and read off disk at build
 * time. Without them Satori falls back to a generic sans and the card stops
 * looking like the site.
 */
const FONT_DIR = join(process.cwd(), "src/assets/fonts");

async function fonts() {
  const [semibold, extrabold] = await Promise.all([
    readFile(join(FONT_DIR, "Inter-600.ttf")),
    readFile(join(FONT_DIR, "Inter-800.ttf")),
  ]);
  return [
    { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: extrabold, weight: 800 as const, style: "normal" as const },
  ];
}

export type OgCardOptions = {
  /** Small uppercase label above the title. */
  kicker: string;
  /** One line per array entry — pre-broken, since Satori does not hyphenate. */
  title: string[];
  /** Supporting sentence. Keep under ~120 characters or it crowds the pills. */
  description: string;
  /** Pills along the bottom. Four is the most that fits comfortably. */
  tags: string[];
  /** Accent hex. Defaults to the site's sky primary. */
  accent?: string;
  /** Accent as `r, g, b` for the translucent fills. */
  accentRgb?: string;
};

export async function renderOgCard({
  kicker,
  title,
  description,
  tags,
  accent = "#0ea5e9",
  accentRgb = "14, 165, 233",
}: OgCardOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          // Opaque base colour first: the gradients sit on top, so a client
          // that ignores backgroundImage still gets the dark brand ground
          // rather than white behind white text.
          background: "#050508",
          backgroundImage: `radial-gradient(circle at 80% 8%, rgba(${accentRgb}, 0.30), transparent 55%), radial-gradient(circle at 5% 95%, rgba(79, 70, 229, 0.20), transparent 55%)`,
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        {/* ── Wordmark + kicker ─────────────────────────────────── */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Software</span>
            <span style={{ color: accent }}>.</span>
            <span>Pros</span>
          </div>
          <div style={{ display: "flex", width: 1, height: 26, background: "rgba(255,255,255,0.18)" }} />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {kicker}
          </div>
        </div>

        {/* ── Title + description ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: title.length > 2 ? 68 : 82,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
            }}
          >
            {title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 27,
              fontWeight: 600,
              lineHeight: 1.45,
              color: "#9aa3b2",
              maxWidth: 950,
            }}
          >
            {description}
          </div>
        </div>

        {/* ── Tag pills ─────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "11px 24px",
                borderRadius: 999,
                border: `1px solid rgba(${accentRgb}, 0.38)`,
                background: `rgba(${accentRgb}, 0.10)`,
                color: accent,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
