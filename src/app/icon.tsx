import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon: the wordmark reduced to its two load-bearing parts — the S and the
 * sky-blue dot that "Software.Pros" hangs on.
 *
 * Rendered at 64px rather than 32 so it stays sharp on retina tab strips, and
 * deliberately not a full "SP" monogram: two letters at tab size read as a
 * smudge, one letter and a dot stays recognisable.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0d14",
          borderRadius: 14,
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          S
        </span>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: "#0ea5e9",
            marginLeft: 2,
            marginTop: 16,
          }}
        />
      </div>
    ),
    size,
  );
}
