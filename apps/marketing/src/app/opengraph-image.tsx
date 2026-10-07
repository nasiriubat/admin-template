import { ImageResponse } from 'next/og';

export const alt = 'Nexus: one design system for every admin and landing page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Literal brand colours are allowed here only: ImageResponse cannot read CSS tokens.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#0b0f19', color: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#564fde', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700 }}>N</div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Nexus</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 700, lineHeight: 1.1, maxWidth: 960 }}>One design system for every admin and landing page</div>
        <div style={{ marginTop: 32, fontSize: 32, color: '#94a3b8' }}>Themeable, accessible and mobile-first.</div>
      </div>
    ),
    size,
  );
}
