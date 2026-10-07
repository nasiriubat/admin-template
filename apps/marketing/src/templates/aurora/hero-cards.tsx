import { AvatarStack, Float, IconRenderer, Parallax, cn } from '@nexus/ui/marketing';

const card = 'rounded-2xl border border-border bg-surface-elevated p-3 text-left shadow-popover';

function Sparkline() {
  return (
    <svg viewBox="0 0 120 36" aria-hidden="true" focusable="false" className="h-9 w-28">
      <path d="M0 30 C12 26 20 32 32 20 S52 14 64 18 S88 6 102 8 S114 4 120 2" fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-primary" />
      <circle cx="120" cy="2" r="3" className="fill-primary" />
    </svg>
  );
}

const people = [{ name: 'Amira' }, { name: 'Tomas' }, { name: 'Riley' }, { name: 'Sana' }];

interface Spot {
  className: string;
  offset: number;
  amplitude: number;
  delay: number;
  rotate: number;
  body: React.ReactNode;
}

const spots: Spot[] = [
  {
    className: 'md:-left-2 md:top-6 lg:-left-16',
    offset: 40,
    amplitude: 12,
    delay: 0,
    rotate: -1.5,
    body: (
      <div className={cn(card, 'w-44')}>
        <p className="text-xs font-medium text-text-muted">Monthly revenue</p>
        <p className="mt-1 text-xl font-semibold">$48.2k</p>
        <div className="flex items-end justify-between">
          <Sparkline />
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">+12%</span>
        </div>
      </div>
    ),
  },
  {
    className: 'md:-right-2 md:top-2 lg:-right-14',
    offset: -30,
    amplitude: 10,
    delay: 1.2,
    rotate: 1.5,
    body: (
      <div className={cn(card, 'flex w-56 items-center gap-3')}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
          <IconRenderer name="Check" className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold">Deploy succeeded</span>
          <span className="block text-xs text-text-muted">v2.4.0 is live in 38s</span>
        </span>
      </div>
    ),
  },
  {
    className: 'md:-left-2 md:bottom-10 lg:-left-10',
    offset: -50,
    amplitude: 14,
    delay: 0.6,
    rotate: 1,
    body: (
      <div className={cn(card, 'w-52')}>
        <AvatarStack people={people} size="sm" max={3} />
        <p className="mt-2 text-sm font-semibold">3 teammates reviewing</p>
        <p className="text-xs text-text-muted">Permissions update</p>
      </div>
    ),
  },
  {
    className: 'md:-right-2 md:bottom-6 lg:-right-8',
    offset: 36,
    amplitude: 12,
    delay: 1.8,
    rotate: -1,
    body: (
      <div className={cn(card, 'w-48')}>
        <p className="text-xs font-medium text-text-muted">Theme preset</p>
        <div className="mt-2 flex gap-1.5">
          {['bg-primary', 'bg-accent', 'bg-success', 'bg-info', 'bg-warning'].map((c) => (
            <span key={c} className={cn('size-6 rounded-full border border-border', c)} />
          ))}
        </div>
        <p className="mt-2 text-sm font-semibold">Modern SaaS</p>
      </div>
    ),
  },
];

/**
 * Decorative cluster of UI cards around the product preview. Stacked in a grid on phones and
 * floating (Float + Parallax) from md up. Hidden from assistive tech: it only illustrates the product.
 */
export function HeroCards() {
  return (
    <div aria-hidden="true" className="mt-6 grid grid-cols-1 justify-items-center gap-3 min-[480px]:grid-cols-2 md:contents">
      {spots.map((s, i) => (
        <Parallax key={i} offset={s.offset} className={cn('md:absolute md:z-10', s.className)}>
          <Float amplitude={s.amplitude} duration={6 + i} delay={s.delay} rotate={s.rotate}>
            {s.body}
          </Float>
        </Parallax>
      ))}
    </div>
  );
}
