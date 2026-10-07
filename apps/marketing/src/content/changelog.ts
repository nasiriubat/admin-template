import type { Release } from '@nexus/ui/marketing';

export const releases: Release[] = [
  { version: '1.4.0', date: '2026-09-22', summary: 'Marketing website templates and a full documentation site.', changes: [
    { type: 'Added', text: 'Pricing, features, about, contact, customers, blog and docs pages for the marketing site.' },
    { type: 'Added', text: 'Shared timeline, comparison table and docs layout sections.' },
    { type: 'Changed', text: 'The marketing header and footer now read from one navigation config.' },
  ] },
  { version: '1.3.2', date: '2026-08-30', summary: 'Accessibility and mobile fixes.', changes: [
    { type: 'Fixed', text: 'Focus ring was clipped on the sidebar collapse button in dark mode.' },
    { type: 'Fixed', text: 'Bottom sheet filters now trap focus and restore it on close.' },
    { type: 'Changed', text: 'Touch targets in data table row actions increased to 44px on coarse pointers.' },
  ] },
  { version: '1.3.0', date: '2026-07-14', summary: 'Operations tooling.', changes: [
    { type: 'Added', text: 'Background jobs, logs and health modules with retry and cancel actions.' },
    { type: 'Added', text: 'Feature flag management with per-environment overrides.' },
    { type: 'Fixed', text: 'CSV export no longer drops the last row when filters are active.' },
  ] },
  { version: '1.2.0', date: '2026-05-19', summary: 'Theme editor.', changes: [
    { type: 'Added', text: 'Live theme editor with contrast checks for every token pair.' },
    { type: 'Changed', text: 'Density control now applies to tables, forms and navigation together.' },
  ] },
  { version: '1.0.0', date: '2026-03-02', summary: 'First stable release.', changes: [
    { type: 'Added', text: 'Admin shell, 10 modules, five theme presets and installable PWA support.' },
    { type: 'Added', text: 'SaaS, AI product and enterprise landing page templates.' },
  ] },
];
