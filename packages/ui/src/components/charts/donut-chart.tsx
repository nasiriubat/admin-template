'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_TONES, toneColor, tooltipStyles } from './chart-theme';
import type { DonutChartProps } from './chart-types';





export function DonutChartImpl({
  data,
  height = 220,
  centerLabel,
  centerValue,
  summary,
  valueFormatter = (v) => v.toLocaleString(),
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <figure role="img" aria-label={summary} className="m-0">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-[220px]" style={{ height }} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer={false} tabIndex={-1}>
              <Pie rootTabIndex={-1} data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
                {data.map((d, i) => (
                  <Cell key={d.name} fill={toneColor(d.tone ?? CHART_TONES[i % CHART_TONES.length])} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} formatter={(v: unknown) => valueFormatter(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          {(centerValue || centerLabel) && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xl font-semibold text-text tabular-nums">{centerValue}</p>
                {centerLabel && <p className="text-xs text-text-muted">{centerLabel}</p>}
              </div>
            </div>
          )}
        </div>
        <ul className="w-full space-y-2 text-sm">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-text">
                <span className="size-2.5 rounded-full" style={{ background: toneColor(d.tone ?? CHART_TONES[i % CHART_TONES.length]) }} aria-hidden="true" />
                {d.name}
              </span>
              <span className="tabular-nums text-text-muted">
                {valueFormatter(d.value)} <span className="text-xs">({total ? Math.round((d.value / total) * 100) : 0}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
