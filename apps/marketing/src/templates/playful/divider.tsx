import { WaveDivider, toneBg, type Tone, type WaveStyle } from '@nexus/ui/marketing';

/** Wave seam between two sections: the wrapper carries the section above, the wave paints the one below. */
export function Divider({ from, to, variant, flip }: { from: Tone; to: Tone; variant: WaveStyle; flip?: boolean }) {
  return (
    <div className={`${toneBg[from]} -mb-px`}>
      <WaveDivider variant={variant} fill={to} flip={flip} heightClass="h-10 sm:h-16 lg:h-24" />
    </div>
  );
}
