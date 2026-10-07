import { AvatarStack, cn } from '@nexus/ui/marketing';

export type BentoVisualKind = 'roles' | 'pwa' | 'theme' | 'ops';

const pill = 'rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium';

function Roles() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {['Owner', 'Admin', 'Editor', 'Viewer'].map((r, i) => (
          <span key={r} className={cn(pill, i === 1 && 'border-primary bg-primary/10 text-primary')}>
            {r}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
        <AvatarStack people={[{ name: 'Amira Haddad' }, { name: 'Tomas Novak' }, { name: 'Riley Nguyen' }, { name: 'Sana Okafor' }, { name: 'Lukas Weber' }]} size="sm" max={3} />
        <span className="text-xs text-text-muted">5 members, 4 roles</span>
      </div>
    </div>
  );
}

function Pwa() {
  return (
    <div aria-hidden="true" className="mx-auto flex h-24 w-16 flex-col items-center rounded-2xl border-2 border-border-strong bg-surface p-1.5">
      <span className="mt-1 h-1 w-6 rounded-full bg-border-strong" />
      <span className="mt-3 grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">N</span>
      <span className="mt-2 h-1.5 w-9 rounded bg-border" />
      <span className="mt-1 h-1.5 w-6 rounded bg-border" />
    </div>
  );
}

function Theme() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-info', 'bg-secondary'].map((c) => (
        <span key={c} className={cn('size-8 rounded-full border border-border transition-transform hover:scale-110 motion-reduce:transition-none', c)} />
      ))}
    </div>
  );
}

function Ops() {
  const rows = [
    ['api-gateway', 'bg-success', 'Healthy'],
    ['nightly-export', 'bg-warning', 'Queued'],
    ['search-index', 'bg-success', 'Healthy'],
  ];
  return (
    <ul className="space-y-2">
      {rows.map(([name, dot, status]) => (
        <li key={name} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm">
          <span className="font-mono text-xs">{name}</span>
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <span aria-hidden="true" className={cn('size-2 rounded-full', dot)} />
            {status}
          </span>
        </li>
      ))}
    </ul>
  );
}

const map = { roles: Roles, pwa: Pwa, theme: Theme, ops: Ops } as const;

export function BentoVisual({ kind }: { kind: BentoVisualKind }) {
  const Visual = map[kind];
  return <Visual />;
}
