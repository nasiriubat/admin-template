import { Float, IconRenderer } from '@nexus/ui/marketing';
import { toneOf, solid } from './tones';

export interface StickerProps {
  label: string;
  icon: string;
  tone: string;
  rotate: number;
  className?: string;
  paused?: boolean;
  delay?: number;
}

/** Sticker-style badge: tilted, bordered, bobbing gently. Purely decorative (aria-hidden). */
export function Sticker({ label, icon, tone, rotate, className, paused, delay = 0 }: StickerProps) {
  return (
    <Float aria-hidden="true" amplitude={8} duration={5} delay={delay} paused={paused} className={`absolute z-10 ${className ?? ''}`}>
      <span style={{ transform: `rotate(${rotate}deg)` }} className={`flex items-center gap-2 rounded-2xl border-2 border-surface px-3.5 py-2 text-sm font-bold shadow-popover ${solid[toneOf(tone)]}`}>
        <IconRenderer name={icon} className="size-4" />
        {label}
      </span>
    </Float>
  );
}
