import type { ReactNode } from 'react';
import { Card, CardContent } from '@nexus/ui';

/** A titled group in the gallery. The `id` powers the in-page jump links. */
export function GallerySection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 space-y-3">
      <div>
        <h2 id={`${id}-h`} className="text-base font-semibold text-text">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      <Card>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </section>
  );
}

/** A labelled specimen (one state of one component). */
export function Specimen({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      {children}
    </div>
  );
}
