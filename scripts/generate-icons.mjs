// Renders branding/logo.svg into every PWA/app icon size using Playwright's bundled Chromium.
import { chromium } from '@playwright/test';
import { mkdir, readFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(path.join(root, 'branding/logo.svg'), 'utf8');
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const inner = svg.replace(/<rect[^>]*\/>/, ''); // artwork without the rounded background

const targets = ['apps/admin/public/icons', 'apps/marketing/public/icons'];
const browser = await chromium.launch();

async function render(html, size, file) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0;background:transparent}img,svg{display:block;width:${size}px;height:${size}px}</style>${html}`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
}

for (const dir of targets) {
  const out = path.join(root, dir);
  await mkdir(out, { recursive: true });
  await copyFile(path.join(root, 'branding/logo.svg'), path.join(out, 'icon.svg'));
  await render(`<img src="${dataUri}"/>`, 192, path.join(out, 'icon-192.png'));
  await render(`<img src="${dataUri}"/>`, 512, path.join(out, 'icon-512.png'));
  await render(`<img src="${dataUri}"/>`, 180, path.join(out, 'apple-touch-icon.png'));
  // Maskable: full-bleed brand colour with the artwork inside the 80% safe zone.
  const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#4f46e5"/><g transform="translate(51 51) scale(0.8)">${inner}</g></svg>`;
  await render(maskable, 512, path.join(out, 'icon-maskable.png'));
}

// Social preview image for the marketing site.
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(`<body style="margin:0;width:1200px;height:630px;background:linear-gradient(135deg,#312e81,#4f46e5);font-family:system-ui,sans-serif;color:#fff;display:flex;align-items:center;gap:48px;padding:0 96px;box-sizing:border-box">
  <img src="${dataUri}" width="200" height="200"/>
  <div><div style="font-size:84px;font-weight:700;letter-spacing:-2px">Nexus Admin</div>
  <div style="font-size:36px;opacity:.85;margin-top:12px">Admin dashboards and landing pages from one design system</div></div></body>`);
await mkdir(path.join(root, 'apps/marketing/public'), { recursive: true });
await og.screenshot({ path: path.join(root, 'apps/marketing/public/og-image.png') });
await browser.close();
console.log('Icons generated for', targets.join(', '));
