"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches errors thrown by the ROOT layout itself, where
 * (site)/error.tsx and owner/error.tsx can't help. It replaces the whole
 * document, so it has to render its own <html>/<body> and can't rely on the
 * app's stylesheet being loaded — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] fatal error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#171717",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#727272",
            }}
          >
            Please try again. If it keeps happening, message us on WhatsApp.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "22px",
              padding: "12px 26px",
              borderRadius: "999px",
              border: "none",
              background: "#171717",
              color: "#ffffff",
              fontSize: "12px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "20px", fontSize: "11px", color: "#727272" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
