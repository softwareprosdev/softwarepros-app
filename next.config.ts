import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Supabase Auth (@supabase/ssr's browser client) talks to the project's API
// directly from the browser for sign-up/login/session refresh — that origin
// has to be in connect-src or every auth call is silently blocked by CSP.
// Read from the same build arg that inlines NEXT_PUBLIC_SUPABASE_URL into the
// bundle (see the ARG/ENV pair in Dockerfile), falling back to the general
// *.supabase.co pattern so a missing env var degrades to "works" rather than
// "auth is silently broken in prod".
const supabaseConnectSrc = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "https://*.supabase.co";
  try {
    return new URL(url).origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

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
  `connect-src 'self' ${supabaseConnectSrc}`,
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Built with `npm run build` and served with `npm start` (`next start`), both
// under Nixpacks and in the Dockerfile that coolify-compose.yaml builds.
// Deliberately NOT `output: "standalone"` — Next warns that "next start does
// not work with output: standalone", so the two are mutually exclusive.
// Standalone would shrink the image, but the same image also runs
// `prisma migrate deploy`, which needs the full node_modules anyway; switching
// means changing the Dockerfile CMD to `node .next/standalone/server.js` and
// finding another home for migrations, in the same commit.
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
      {
        // Generated images: share cards and favicons. Next appends a
        // content hash to these URLs, so the bytes behind any given URL never
        // change and they can be cached hard.
        //
        // This matters more than it looks. Facebook, iMessage, WhatsApp and
        // Slack each re-fetch the card on every fresh share, and the default
        // `max-age=0, must-revalidate` makes each of those a cold render.
        // iMessage in particular gives up on a slow image and shows a bare
        // link instead of the banner.
        source:
          "/:path*/:image(opengraph-image|twitter-image|icon|apple-icon)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:image(opengraph-image|twitter-image|icon|apple-icon)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
