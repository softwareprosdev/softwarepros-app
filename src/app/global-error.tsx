"use client"; // Error boundaries must be Client Components.

/**
 * Last-resort boundary: this replaces the root layout, so it ships no global
 * styles, no `@theme` tokens, and no next/font families. Everything here is
 * inline on purpose — the palette is hand-copied from `globals.css` because a
 * failure that reaches this file cannot rely on the stylesheet having loaded.
 *
 * Site is dark-only, so the colours are stated outright rather than left to
 * the OS colour scheme (which is all the default UI would follow).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          background: "#050508",
          color: "#e5e7eb",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <title>Something Went Wrong | SoftwarePros</title>

        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#ffffff",
            }}
          >
            Software<span style={{ color: "#0ea5e9" }}>.</span>Pros
          </span>

          <h1
            style={{
              margin: "2rem 0 0.75rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              margin: "0 0 1.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: "#9ca3af",
            }}
          >
            The application hit an unrecoverable error and could not finish
            rendering. It has been logged. Reloading usually clears it.
          </p>

          {error.digest && (
            <p
              style={{
                margin: "0 0 2rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#4b5563",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(to right, #2563eb, #4f46e5)",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            {/* Deliberately not next/link: the React tree that owns the
                router is the thing that just failed, so this needs to be a
                full document load, not a soft navigation back into it. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#d1d5db",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back To Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
