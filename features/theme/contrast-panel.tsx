'use client';

import { useMemo } from 'react';
import { useTheme } from '@nexus/theme';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nexus/ui';
import { AA_NORMAL, contrastRows } from './theme-io';

/** WCAG 2.x contrast of every token pair for the active preset and color mode. */
export function ContrastPanel() {
  const { preset, resolvedMode } = useTheme();
  const rows = useMemo(() => contrastRows(preset.colors[resolvedMode]), [preset, resolvedMode]);
  const failing = rows.filter((r) => !r.pass).length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Contrast check</CardTitle>
          <CardDescription>
            {preset.name}, {resolvedMode} mode. WCAG AA needs {AA_NORMAL}:1 for normal text.
          </CardDescription>
        </div>
        <Badge variant={failing ? 'danger' : 'success'} dot>{failing ? `${failing} failing` : 'All pass AA'}</Badge>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <caption className="sr-only">Contrast ratio per token pair</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Pair</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Ratio</th>
              <th scope="col" className="py-2 text-right font-medium">AA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-2 pr-3 text-left font-normal text-text">{row.label}</th>
                <td className="py-2 pr-3 text-right tabular-nums text-text">{row.ratio.toFixed(2)}:1</td>
                <td className="py-2 text-right">
                  <Badge variant={row.pass ? 'success' : 'danger'}>{row.pass ? 'Pass' : 'Fail'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
