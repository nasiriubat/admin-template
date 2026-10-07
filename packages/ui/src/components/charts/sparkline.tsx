'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { toneColor } from './chart-theme';
import type { SparklineProps } from './chart-types';



export function SparklineImpl({ values, tone = 'primary', height = 36 }: SparklineProps) {
  const data = values.map((v, i) => ({ i, v }));
  const color = toneColor(tone);
  return (
    <div style={{ height }} aria-hidden="true" inert className="mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart accessibilityLayer={false} data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Area dataKey="v" stroke={color} strokeWidth={1.75} fill={color} fillOpacity={0.12} type="monotone" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
