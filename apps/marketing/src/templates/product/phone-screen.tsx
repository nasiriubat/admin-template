import { IconRenderer, PhoneFrame, cn } from '@nexus/ui/marketing';
import type { PhoneScreenData } from '../../content/product';
import { toneSoft } from './dashboard-mock';

/** Contents of a phone: app bar, record cards and bottom navigation. Pure markup, token colours only. */
export function PhoneScreen({ screen }: { screen: PhoneScreenData }) {
  return (
    <div role="img" aria-label={`Illustration of the ${screen.title} screen on a phone: ${screen.tagline}`} className="flex h-full flex-col bg-canvas pt-9 text-left">
      <p className="px-4 pb-2 text-base font-semibold">{screen.header}</p>
      <ul className="flex-1 space-y-2 px-3">
        {screen.items.map((it) => (
          <li key={it.title} className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold">{it.title}</p>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', toneSoft[it.tone])}>{it.badge}</span>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">{it.meta}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-4 border-t border-border bg-surface px-1 py-2">
        {screen.nav.map((n, i) => (
          <span key={n.label} className={cn('flex flex-col items-center gap-0.5 text-[10px]', i === screen.activeNav ? 'font-semibold text-primary' : 'text-text-muted')}>
            <IconRenderer name={n.icon} className="size-4" />
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A phone mockup showing one screen. */
export function PhoneDevice({ screen, className }: { screen: PhoneScreenData; className?: string }) {
  return (
    <PhoneFrame className={className}>
      <PhoneScreen screen={screen} />
    </PhoneFrame>
  );
}
