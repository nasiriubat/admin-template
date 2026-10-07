'use client';

import { useTheme, type ColorMode } from '@nexus/theme';
import { Label } from '../ui/label';
import { SegmentedControl } from '../ui/segmented-control';

/** Preset, mode, density and motion controls. Shared by the top-bar popover, mobile sheet and Theme editor. */
export function ThemeControls({ className }: { className?: string }) {
  const { preset, availablePresets, setPreset, mode, setMode, density, setDensity, motion, setMotion, radius, setRadius } = useTheme();
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Preset</Label>
          <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Theme preset">
            {availablePresets.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={preset.id === p.id}
                onClick={() => setPreset(p.id)}
                className={
                  preset.id === p.id
                    ? 'truncate rounded-lg border border-primary bg-primary px-2.5 py-2 text-left text-xs font-medium text-primary-foreground'
                    : 'truncate rounded-lg border border-border bg-canvas px-2.5 py-2 text-left text-xs font-medium text-text hover:border-border-strong'
                }
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color mode</Label>
          <SegmentedControl<ColorMode> label="Color mode" value={mode} onChange={setMode} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
        </div>
        <div className="space-y-1.5">
          <Label>Density</Label>
          <SegmentedControl label="Density" value={density} onChange={setDensity} options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'spacious', label: 'Spacious' }]} />
        </div>
        <div className="space-y-1.5">
          <Label>Motion</Label>
          <SegmentedControl label="Motion" value={motion} onChange={setMotion} options={[{ value: 'minimal', label: 'Minimal' }, { value: 'standard', label: 'Standard' }, { value: 'expressive', label: 'Expressive' }]} />
        </div>
        <div className="space-y-1.5">
          <Label>Corner shape</Label>
          <SegmentedControl label="Corner shape" value={radius} onChange={setRadius} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'pill', label: 'Pill' }]} />
        </div>
      </div>
    </div>
  );
}
