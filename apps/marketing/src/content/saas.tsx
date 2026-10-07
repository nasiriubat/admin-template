export const saas = {
  brand: 'Nexus',
  tagline: 'One design system for every admin and landing page you ship.',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: 'Start free', href: '#pricing' },
  logos: ['Northwind', 'Lumen', 'Parcel', 'Helix', 'Atlas', 'Vertex'],
  features: [
    { icon: 'LayoutDashboard', title: 'Real app shell', description: 'Persistent sidebar, top bar, breadcrumbs and a mobile app experience, ready on day one.' },
    { icon: 'Palette', title: 'Themeable by design', description: 'Five presets, light and dark, density and corner controls, all driven by tokens.' },
    { icon: 'ShieldCheck', title: 'Permissions built in', description: 'Role-aware navigation, guarded routes and an audit trail across every module.' },
    { icon: 'Layers', title: 'Modular features', description: 'Switch users, roles, jobs, logs and more on or off per project with one config file.' },
    { icon: 'Smartphone', title: 'Mobile first', description: 'Tables become record cards, filters become bottom sheets, navigation lives under your thumb.' },
    { icon: 'Zap', title: 'Fast and accessible', description: 'Keyboard friendly, WCAG-minded contrast, reduced-motion support and installable as a PWA.' },
  ],
  stats: [
    { value: '14', label: 'ready modules' },
    { value: '5', label: 'theme presets' },
    { value: 'AA', label: 'contrast checked' },
    { value: '0', label: 'proprietary fonts' },
  ],
  steps: [
    { icon: 'Settings', title: 'Configure', description: 'Name your product, pick a preset and enable the modules you need in one config file.' },
    { icon: 'Server', title: 'Connect', description: 'Point the typed API client at any backend that follows the simple response contract.' },
    { icon: 'Rocket', title: 'Ship', description: 'Deploy the admin and the marketing site independently with the included Docker setup.' },
  ],
  testimonials: [
    { quote: 'We replaced three internal dashboards with one codebase and our designers finally stopped fixing spacing.', name: 'Amira Haddad', role: 'Head of Engineering, Parcel' },
    { quote: 'Permission-aware navigation saved us weeks. The audit log passed our security review on the first try.', name: 'Tomas Novak', role: 'CTO, Helix' },
    { quote: 'Dark mode, mobile and keyboard support were already done. We just added our own modules.', name: 'Riley Nguyen', role: 'Founder, Lumen' },
  ],
  tiers: [
    { name: 'Starter', price: '$0', period: '/ forever', description: 'For side projects and prototypes.', features: ['Admin shell and theme engine', '5 core modules', 'Community support'], cta: { label: 'Get started', href: '#' } },
    { name: 'Team', price: '$49', period: '/ month', description: 'For products with a real user base.', features: ['All 14 modules', 'Landing page templates', 'Priority support', 'Private updates'], cta: { label: 'Start trial', href: '#' }, featured: true },
    { name: 'Agency', price: '$199', period: '/ month', description: 'Reuse across every client project.', features: ['Unlimited projects', 'White-label rights', 'Onboarding session'], cta: { label: 'Contact sales', href: '#' } },
  ],
  faq: [
    { q: 'Can I use my own backend?', a: 'Yes. The admin talks to a typed API client that follows a documented response envelope, so FastAPI, Laravel, Django, Node or Go all work.' },
    { q: 'Does it work on mobile?', a: 'Mobile is a first-class layout: bottom navigation, bottom-sheet filters and tables that turn into record cards.' },
    { q: 'How do I remove modules I do not need?', a: 'Set the module flag to false in the app config. Its navigation and routes disappear.' },
    { q: 'Is it accessible?', a: 'Focus states, keyboard access, contrast ratios and reduced-motion support are verified by automated tests.' },
  ],
};
