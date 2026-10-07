'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_COLOR, CHART_TONES, GRID_COLOR, toneColor, tooltipStyles } from './chart-theme';
import type { ChartSeries, TimeSeriesChartProps } from './chart-types';





/**
 * Area / line / bar chart over a shared x axis. Exposes a visually hidden data table so the data
 * is available to assistive tech (charts alone are not accessible).
 */
export function TimeSeriesChartImpl<T extends object>({
  data,
  xKey,
  series,
  variant = 'area',
  stacked,
  height = 280,
  valueFormatter = (v) => v.toLocaleString(),
  xFormatter,
  summary,
}: TimeSeriesChartProps<T>) {
  const common = { data, margin: { top: 8, right: 8, bottom: 0, left: 0 } };
  const axes = (
    <>
      <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey={xKey as never}
        tick={{ fill: AXIS_COLOR, fontSize: 12 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
        tickFormatter={xFormatter}
        minTickGap={24}
      />
      <YAxis
        tick={{ fill: AXIS_COLOR, fontSize: 12 }}
        tickLine={false}
        axisLine={false}
        width={48}
        tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : String(v))}
      />
      <Tooltip
        {...tooltipStyles}
        formatter={(value: unknown) => valueFormatter(Number(value))}
        labelFormatter={(label: unknown) => (xFormatter ? xFormatter(String(label)) : String(label))}
        cursor={{ stroke: GRID_COLOR }}
      />
      {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />}
    </>
  );

  const color = (s: ChartSeries, i: number) => toneColor(s.tone ?? CHART_TONES[i % CHART_TONES.length]);

  return (
    <figure role="img" aria-label={summary} className="m-0">
      <div style={{ height }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'bar' ? (
            <BarChart accessibilityLayer={false} tabIndex={-1} {...common}>
              {axes}
              {series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={color(s, i)} radius={[4, 4, 0, 0]} stackId={stacked ? 'a' : undefined} />
              ))}
            </BarChart>
          ) : variant === 'line' ? (
            <LineChart accessibilityLayer={false} tabIndex={-1} {...common}>
              {axes}
              {series.map((s, i) => (
                <Line key={s.key} dataKey={s.key} name={s.label} stroke={color(s, i)} strokeWidth={2} dot={false} type="monotone" />
              ))}
            </LineChart>
          ) : (
            <AreaChart accessibilityLayer={false} tabIndex={-1} {...common}>
              <defs>
                {series.map((s, i) => (
                  <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color(s, i)} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color(s, i)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {axes}
              {series.map((s, i) => (
                <Area
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stroke={color(s, i)}
                  strokeWidth={2}
                  fill={`url(#fill-${s.key})`}
                  type="monotone"
                  stackId={stacked ? 'a' : undefined}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">{xKey}</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{String(row[xKey])}</th>
                {series.map((s) => (
                  <td key={s.key}>{valueFormatter(Number((row as Record<string, unknown>)[s.key]))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
