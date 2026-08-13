import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon. Same mark as `icon.tsx`, but iOS clips to its own
 * squircle and paints no background behind it — so this one fills the square
 * edge to edge instead of relying on a border radius.
 */
export default function AppleIcon() {
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
          backgroundImage:
            "radial-gradient(circle at 70% 20%, rgba(14, 165, 233, 0.28), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 116,
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
            width: 24,
            height: 24,
            borderRadius: 999,
            background: "#0ea5e9",
            marginLeft: 6,
            marginTop: 44,
          }}
        />
      </div>
    ),
    size,
  );
}
