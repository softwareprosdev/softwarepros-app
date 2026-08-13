import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * `unsafe-inline` for styles is required by Next's inlined critical CSS and by
 * the design's inline `style` attributes. Scripts additionally need
 * `unsafe-eval` in development for React Refresh only.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://storage.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Design imagery and testimonial avatars shipped with the approved
        // comps. Swap for your own asset host before launch.
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/uxpilot-auth.appspot.com/**",
      },
    ],
  },

  async rewrites() {
    // RFC 9116 puts security.txt under /.well-known. Next's router ignores
    // directories beginning with a dot, so the handler lives at /security.txt
    // and the canonical path rewrites onto it. Same for the AI index files,
    // which some agents look for under /.well-known as well as at the root.
    return [
      { source: "/.well-known/security.txt", destination: "/security.txt" },
      { source: "/.well-known/llms.txt", destination: "/llms.txt" },
      { source: "/.well-known/ai.txt", destination: "/ai.txt" },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // The discovery centre needs the mic; nothing else is used.
            value: "camera=(), geolocation=(), microphone=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Discovery sessions, summaries and admin pages are per-client data —
        // keep them out of shared and intermediary caches.
        source: "/:path(discovery|summary|admin)/:rest*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
