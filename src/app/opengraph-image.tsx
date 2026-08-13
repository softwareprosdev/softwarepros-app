import { ImageResponse } from "next/og";

export const alt =
  "SoftwarePros — AI, software engineering, cybersecurity, and cloud infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide share card. Generated at build time rather than checked in as a
 * PNG so the palette stays tied to the tokens in `globals.css`.
 *
 * Satori (what backs ImageResponse) supports a subset of CSS and requires an
 * explicit `display` on any element with more than one child — hence the
 * flex declarations that look redundant here but are not.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#050508",
          backgroundImage:
            "radial-gradient(circle at 78% 12%, rgba(14, 165, 233, 0.22), transparent 55%), radial-gradient(circle at 8% 92%, rgba(79, 70, 229, 0.18), transparent 55%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34 }}>
          <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Software
          </span>
          <span style={{ color: "#0ea5e9", fontWeight: 700 }}>.</span>
          <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Pros</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Build Software</span>
            <span>That Doesn&apos;t Break</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              color: "#9ca3af",
              lineHeight: 1.4,
            }}
          >
            Intelligent systems for organizations replacing complexity with
            automation, security, and scale.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["AI", "Software Engineering", "Cybersecurity", "Cloud"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "12px 26px",
                  borderRadius: 999,
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  background: "rgba(14, 165, 233, 0.08)",
                  color: "#7dd3fc",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
