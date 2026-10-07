export const featureGroups = [
  {
    id: 'shell',
    icon: 'LayoutDashboard',
    eyebrow: 'Application shell',
    title: 'A real app experience on every screen size',
    description: 'A persistent sidebar and breadcrumbs on desktop become bottom navigation and a full-height menu on phones, without a second codebase.',
    bullets: ['Role-aware navigation', 'Command palette with keyboard shortcuts', 'Installable PWA with offline fallback'],
  },
  {
    id: 'data',
    icon: 'Database',
    eyebrow: 'Data tables',
    title: 'Tables that turn into records on mobile',
    description: 'Sorting, filtering, saved views, column controls and exports are built in. On small screens each row becomes a readable record card.',
    bullets: ['Server or client pagination', 'Saved filters and CSV export', 'Loading, empty and error states included'],
  },
  {
    id: 'theme',
    icon: 'Palette',
    eyebrow: 'Theme engine',
    title: 'Rebrand the whole product from tokens',
    description: 'Five presets, light and dark, density and corner controls. Every colour comes from a token, so a new brand never means editing components.',
    bullets: ['Live preview with contrast checks', 'Reduced-motion support', 'No proprietary fonts'],
  },
] as const;

export const integrations = [
  { name: 'REST APIs', category: 'Backend', icon: 'Server' },
  { name: 'PostgreSQL', category: 'Database', icon: 'Database' },
  { name: 'Webhooks', category: 'Events', icon: 'Webhook' },
  { name: 'OIDC and SAML', category: 'Identity', icon: 'KeyRound' },
  { name: 'Email delivery', category: 'Messaging', icon: 'Mail' },
  { name: 'Object storage', category: 'Files', icon: 'FolderOpen' },
  { name: 'Payments', category: 'Billing', icon: 'CreditCard' },
  { name: 'Metrics export', category: 'Observability', icon: 'Activity' },
];

export const securityItems = [
  { icon: 'ShieldCheck', title: 'Secure defaults', description: 'Strict content security policy, hardened headers and no secrets in the client bundle.' },
  { icon: 'FileText', title: 'Audit trail', description: 'Sensitive actions are recorded with who, what and when, and can be exported.' },
  { icon: 'Lock', title: 'Least privilege', description: 'Permissions are checked in navigation, routes and API services, not only in the interface.' },
  { icon: 'KeyRound', title: 'Compliance ready', description: 'Documentation maps controls to common security questionnaires to speed up reviews.' },
];
