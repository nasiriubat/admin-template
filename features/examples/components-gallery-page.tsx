'use client';

import { PageContainer, PageHeader } from '@nexus/ui';
import { ExampleBanner } from './example-banner';
import { GalleryCharts, GalleryData, GalleryStates, GalleryStatus } from './gallery-display';
import { GalleryButtons, GalleryInputs, GalleryPickers } from './gallery-forms';
import { GalleryOverlays } from './gallery-overlays';

const LINKS = [
  ['buttons', 'Buttons'],
  ['inputs', 'Inputs'],
  ['pickers', 'Pickers'],
  ['overlays', 'Overlays'],
  ['feedback', 'Feedback'],
  ['data', 'Data display'],
  ['states', 'States'],
  ['charts', 'Charts'],
] as const;

/** Every shared component in its main states. Switch theme and resize the window to check both modes. */
export function ComponentGalleryPage() {
  return (
    <PageContainer>
      <ExampleBanner />
      <PageHeader title="Component gallery" description="Every shared component from @nexus/ui, with its states. Use it as a visual regression surface." />
      <nav aria-label="Gallery sections" className="flex flex-wrap gap-2">
        {LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="inline-flex h-8 items-center rounded-full border border-border bg-surface px-3 text-xs font-medium text-text-muted hover:text-text [@media(pointer:coarse)]:min-h-11">
            {label}
          </a>
        ))}
      </nav>
      <GalleryButtons />
      <GalleryInputs />
      <GalleryPickers />
      <GalleryOverlays />
      <GalleryStatus />
      <GalleryData />
      <GalleryStates />
      <GalleryCharts />
    </PageContainer>
  );
}
