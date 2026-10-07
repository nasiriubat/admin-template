import { IconRenderer, Marquee, cn } from '@nexus/ui/marketing';
import { neon } from './neon';

const icons = ['FileText', 'Inbox', 'Terminal', 'Database', 'FolderOpen', 'Send', 'BookOpen', 'Server', 'Sparkles', 'Layers', 'Filter', 'Cpu'];

export function NeonIntegrations({ items }: { items: string[] }) {
  return (
    <section aria-labelledby="integrations-title" className={cn('relative border-y py-10', neon.border)}>
      <h2 id="integrations-title" className={cn('mb-6 text-center font-mono text-xs font-semibold uppercase tracking-widest', neon.muted)}>
        Sources and models it works with
      </h2>
      <Marquee label="Supported sources and models" speed={42} gap={28}>
        {items.map((name, i) => (
          <span key={name} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium', neon.panel)}>
            <IconRenderer name={icons[i % icons.length]!} className="size-4" />
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
