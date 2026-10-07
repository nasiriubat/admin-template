import type { TemplateInfo } from '../lib/templates';

const fill = (tone: string) => `rgb(var(--${tone === 'surface' || tone === 'canvas' ? tone : tone}-rgb))`;

/** Tiny token-driven thumbnail so each template is recognisable in the switcher and gallery. */
export function TemplatePreview({ template }: { template: TemplateInfo }) {
  const [a, b, c] = template.tones.map(fill);
  const variants: Record<string, React.ReactNode> = {
    aurora: (
      <>
        <circle cx="30" cy="22" r="26" fill={a} opacity=".35" />
        <circle cx="96" cy="16" r="22" fill={b} opacity=".3" />
        <rect x="26" y="26" width="68" height="8" rx="4" fill="rgb(var(--text-rgb))" opacity=".75" />
        <rect x="40" y="40" width="40" height="5" rx="2.5" fill="rgb(var(--text-muted-rgb))" opacity=".6" />
        <rect x="18" y="56" width="26" height="22" rx="6" fill={c} stroke="rgb(var(--border-rgb))" />
        <rect x="47" y="52" width="26" height="22" rx="6" fill={c} stroke="rgb(var(--border-rgb))" />
        <rect x="76" y="58" width="26" height="22" rx="6" fill={c} stroke="rgb(var(--border-rgb))" />
        <path d="M0 84 C30 74 60 94 120 82 V90 H0Z" fill={a} opacity=".5" />
      </>
    ),
    neon: (
      <>
        <rect width="120" height="90" fill="rgb(var(--secondary-rgb))" />
        <path d="M0 30H120M0 60H120M30 0V90M60 0V90M90 0V90" stroke="rgb(var(--text-rgb))" strokeOpacity=".12" />
        <circle cx="92" cy="26" r="18" fill={a} opacity=".55" />
        <circle cx="24" cy="66" r="14" fill={b} opacity=".45" />
        <rect x="22" y="22" width="60" height="7" rx="3.5" fill="rgb(var(--text-rgb))" opacity=".9" />
        <path d="M24 60H50L60 48H84" stroke={b} strokeWidth="2" fill="none" />
        <circle cx="50" cy="60" r="4" fill={a} />
        <circle cx="84" cy="48" r="4" fill={a} />
      </>
    ),
    editorial: (
      <>
        <rect width="120" height="90" fill="rgb(var(--canvas-rgb))" />
        <rect x="14" y="14" width="56" height="8" rx="4" fill="rgb(var(--text-rgb))" opacity=".8" />
        <rect x="14" y="28" width="40" height="5" rx="2.5" fill="rgb(var(--text-muted-rgb))" opacity=".6" />
        <path d="M0 52 Q60 36 120 52 V90 H0Z" fill={a} opacity=".35" />
        <path d="M0 64 Q60 50 120 64 V90 H0Z" fill={b} opacity=".4" />
        <rect x="14" y="68" width="28" height="14" rx="4" fill="rgb(var(--surface-rgb))" />
        <rect x="46" y="68" width="28" height="14" rx="4" fill="rgb(var(--surface-rgb))" />
      </>
    ),
    playful: (
      <>
        <path d="M18 24 C10 8 40 2 52 14 C66 28 40 44 24 38 C16 35 20 28 18 24Z" fill={a} opacity=".7" />
        <circle cx="94" cy="26" r="16" fill={b} opacity=".7" />
        <path d="M70 60 L80 44 L90 60Z" fill={c} />
        <rect x="22" y="52" width="40" height="16" rx="8" fill="rgb(var(--text-rgb))" opacity=".85" />
        <path d="M18 80 q6 -8 12 0 t12 0 t12 0 t12 0" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M100 66 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1z" fill={b} />
      </>
    ),
    product: (
      <>
        <rect width="120" height="90" fill="rgb(var(--canvas-rgb))" />
        <rect x="26" y="12" width="68" height="46" rx="5" fill="rgb(var(--surface-rgb))" stroke="rgb(var(--border-strong-rgb, var(--border-rgb)))" />
        <rect x="26" y="12" width="68" height="9" rx="5" fill="rgb(var(--border-rgb))" />
        <rect x="32" y="27" width="22" height="26" rx="3" fill={b} opacity=".5" />
        <rect x="58" y="27" width="30" height="5" rx="2" fill={a} opacity=".8" />
        <rect x="58" y="36" width="24" height="4" rx="2" fill="rgb(var(--text-muted-rgb))" opacity=".5" />
        <rect x="88" y="40" width="22" height="42" rx="6" fill="rgb(var(--surface-rgb))" stroke="rgb(var(--border-rgb))" />
        <rect x="92" y="46" width="14" height="22" rx="2" fill={a} opacity=".6" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 120 90" role="img" aria-label={`${template.name} template preview`} className="h-full w-full">
      {variants[template.id] ?? <rect width="120" height="90" fill={a} />}
    </svg>
  );
}
