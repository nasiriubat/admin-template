/**
 * Class tokens for the Neon "dark island". The page sets `bg-secondary text-secondary-foreground`
 * (always a dark surface with a light foreground in every preset and in both modes); everything
 * inside derives from those two tokens with color-mix, so no colour is hard-coded and contrast
 * holds in light and dark mode (muted text is 88% foreground, verified >= 4.5:1 by the axe E2E sweep).
 * The `color:` hints keep tailwind-merge from confusing these with background-image / border-width.
 */
export const neon = {
  text: 'text-secondary-foreground',
  muted: 'text-[color:color-mix(in_srgb,var(--secondary-foreground)_88%,transparent)]',
  glass: 'bg-[color:color-mix(in_srgb,var(--secondary-foreground)_7%,transparent)]',
  glassStrong: 'bg-[color:color-mix(in_srgb,var(--secondary-foreground)_12%,transparent)]',
  border: 'border-[color:color-mix(in_srgb,var(--secondary-foreground)_18%,transparent)]',
  panel:
    'border bg-[color:color-mix(in_srgb,var(--secondary-foreground)_7%,transparent)] border-[color:color-mix(in_srgb,var(--secondary-foreground)_18%,transparent)] text-secondary-foreground',
} as const;
