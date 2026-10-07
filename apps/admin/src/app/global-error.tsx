'use client';

/** Last-resort boundary: renders without the app providers, so it uses plain, token-free fallbacks. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100dvh', margin: 0, background: '#f8fafc', color: '#0f172a' }}>
        <main style={{ textAlign: 'center', padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ margin: '0 0 20px', color: '#475569' }}>An unexpected error stopped the app. Please try again.</p>
          <button onClick={reset} style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#4f46e5', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
