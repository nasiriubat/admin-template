# Branding

`logo.svg` is the single source for every icon. Replace it with your own mark (keep the 512x512 viewBox and
leave about 12% padding around the artwork so the maskable icon is not clipped), then run:

```bash
pnpm icons
```

This regenerates `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable.png` and `apple-touch-icon.png` for the
admin and marketing apps, plus `og-image.png` for social sharing. Update the colours in `apps/*/public/manifest.webmanifest`
and the `themeColor` values in each `layout.tsx` to match your brand.
