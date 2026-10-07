/** Series colours are token-driven so every chart follows the active preset and light/dark mode. */
export type ChartTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const CHART_TONES: ChartTone[] = ['primary', 'accent', 'success', 'warning', 'info', 'danger'];

export const toneColor = (tone: ChartTone) => `rgb(var(--${tone}-rgb))`;
export const GRID_COLOR = 'rgb(var(--border-rgb))';
export const AXIS_COLOR = 'rgb(var(--text-muted-rgb))';

export const tooltipStyles = {
  contentStyle: {
    background: 'rgb(var(--surface-elevated-rgb))',
    border: '1px solid rgb(var(--border-rgb))',
    borderRadius: 'var(--radius-md)',
    color: 'rgb(var(--text-rgb))',
    fontSize: 12,
    boxShadow: '0 10px 30px -8px rgb(0 0 0 / 0.25)',
  },
  labelStyle: { color: 'rgb(var(--text-muted-rgb))', marginBottom: 4 },
  itemStyle: { color: 'rgb(var(--text-rgb))' },
} as const;
