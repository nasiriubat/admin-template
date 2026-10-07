export const enterprise = {
  brand: 'Nexus Research',
  tagline: 'Governed data and reproducible analysis for research teams.',
  links: [
    { label: 'Platform', href: '#platform' },
    { label: 'Security', href: '#security' },
    { label: 'Compare', href: '#compare' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: 'Book a demo', href: '#contact' },
  features: [
    { icon: 'Database', title: 'Governed datasets', description: 'Versioned data with lineage, access policies and retention controls.' },
    { icon: 'FileText', title: 'Reproducible runs', description: 'Every analysis records code, parameters and data versions so results can be re-created.' },
    { icon: 'Users', title: 'Team workspaces', description: 'Projects, roles and review workflows that mirror how your organisation works.' },
    { icon: 'ShieldCheck', title: 'Audit everything', description: 'Immutable activity records for access, exports and configuration changes.' },
    { icon: 'KeyRound', title: 'Single sign-on', description: 'SAML and OIDC with group-to-role mapping and enforced multi-factor authentication.' },
    { icon: 'Cpu', title: 'Scalable compute', description: 'Queue-based jobs with quotas, priorities and cost reporting per project.' },
  ],
  stats: [
    { value: '120+', label: 'institutions' },
    { value: '2.4M', label: 'runs archived' },
    { value: '99.95%', label: 'uptime' },
    { value: '24/7', label: 'support' },
  ],
  comparison: {
    columns: ['Spreadsheets and scripts', 'Nexus Research'],
    rows: [
      ['Versioned data and lineage', 'No', 'Yes'],
      ['Role-based access and review', 'Partial', 'Yes'],
      ['Audit trail of exports', 'No', 'Yes'],
      ['Reproducible runs', 'Manual', 'Automatic'],
      ['Single sign-on', 'No', 'Yes'],
    ],
  },
  testimonials: [
    { quote: 'Reproducibility used to be a heroic effort. Now it is the default.', name: 'Dr. Elif Kaya', role: 'Director, Data Science Institute' },
    { quote: 'Our compliance office finally has a single place to review access and exports.', name: 'Henrik Larsen', role: 'CISO, Meridian Health' },
    { quote: 'Onboarding new researchers dropped from weeks to a day.', name: 'Priya Singh', role: 'Research Operations Lead' },
  ],
  faq: [
    { q: 'Can we deploy in our own environment?', a: 'Yes. A containerised deployment is available for private cloud and on-premises installations.' },
    { q: 'How is access controlled?', a: 'Through roles and project permissions, with SSO and enforced multi-factor authentication on request.' },
    { q: 'What happens to our data if we leave?', a: 'You can export datasets, runs and the full audit trail in open formats.' },
  ],
};
