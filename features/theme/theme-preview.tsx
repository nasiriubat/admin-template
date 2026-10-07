'use client';

import { Alert, Badge, Button, Card, Input, Switch } from '@nexus/ui';

const SWATCHES = [
  { name: 'Primary', className: 'bg-primary text-primary-foreground' },
  { name: 'Secondary', className: 'bg-secondary text-secondary-foreground' },
  { name: 'Accent', className: 'bg-accent text-accent-foreground' },
  { name: 'Success', className: 'bg-success text-success-foreground' },
  { name: 'Warning', className: 'bg-warning text-warning-foreground' },
  { name: 'Danger', className: 'bg-danger text-danger-foreground' },
  { name: 'Info', className: 'bg-info text-info-foreground' },
] as const;

function Label({ children }: { children: string }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{children}</h3>;
}

/** Live view of the semantic tokens. Everything here reads CSS variables, so it updates instantly. */
export function ThemePreview() {
  return (
    <div className="space-y-6">
      <section className="space-y-2" aria-label="Surface layers">
        <Label>Surface layers</Label>
        <div className="rounded-card border border-border bg-canvas p-4">
          <p className="text-xs font-medium text-text-muted">Canvas</p>
          <div className="mt-3 rounded-card border border-border bg-surface p-4 shadow-card">
            <p className="text-sm font-medium text-text">Surface</p>
            <p className="text-sm text-text-muted">Cards and tables sit here.</p>
            <div className="mt-3 rounded-card border border-border bg-surface-elevated p-4 shadow-popover">
              <p className="text-sm font-medium text-text">Elevated surface</p>
              <p className="text-sm text-text-muted">Menus, dialogs and popovers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2" aria-label="Semantic colors">
        <Label>Semantic colors</Label>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {SWATCHES.map((s) => (
            <li key={s.name} className={`rounded-input px-3 py-3 text-sm font-medium ${s.className}`}>
              {s.name}
              <span className="block text-xs font-normal opacity-90">Aa text</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" aria-label="Components">
        <Label>Buttons and badges</Label>
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Delete</Button>
            <Button variant="danger-ghost">Remove</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success" dot>Active</Badge>
            <Badge variant="warning" dot>Pending</Badge>
            <Badge variant="danger" dot>Failed</Badge>
            <Badge variant="info" dot>Invited</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <Input aria-label="Sample input" placeholder="Sample input" />
            <label className="flex items-center gap-2 text-sm text-text">
              <Switch defaultChecked aria-label="Sample switch" /> Notifications
            </label>
          </div>
        </Card>
      </section>

      <section className="space-y-2" aria-label="Table row">
        <Label>Table row</Label>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] border-b border-border bg-canvas px-4 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            <span>User</span>
            <span>Status</span>
          </div>
          {[
            ['Avery Morgan', 'success', 'Active'],
            ['Jordan Lee', 'info', 'Invited'],
          ].map(([name, variant, status]) => (
            <div key={name} className="grid min-h-row grid-cols-[1fr_auto] items-center border-b border-border px-4 text-sm last:border-b-0 hover:bg-canvas">
              <span className="text-text">{name}</span>
              <Badge variant={variant as 'success' | 'info'} dot>{status}</Badge>
            </div>
          ))}
        </Card>
      </section>

      <section className="space-y-2" aria-label="Alerts">
        <Label>Alerts</Label>
        <div className="space-y-2">
          <Alert variant="info" title="Heads up">Alerts keep their meaning in every theme.</Alert>
          <Alert variant="danger" title="Something failed">Check the connection and try again.</Alert>
        </div>
      </section>
    </div>
  );
}
