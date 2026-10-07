export const ai = {
  brand: 'Nexus AI',
  tagline: 'Retrieval, prompts and evaluations in one workspace.',
  links: [
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: 'Request access', href: '#pricing' },
  layers: [
    { icon: 'Globe', label: 'Sources', description: 'Documents, wikis, tickets and databases synced on a schedule.' },
    { icon: 'Layers', label: 'Chunking and embeddings', description: 'Structure-aware splitting with versioned embedding models.' },
    { icon: 'Database', label: 'Vector and keyword index', description: 'Hybrid retrieval with metadata filters and per-tenant isolation.' },
    { icon: 'Sparkles', label: 'Generation', description: 'Prompt templates, guardrails and model routing with fallbacks.' },
    { icon: 'Activity', label: 'Evaluation', description: 'Regression suites and live quality metrics on every release.' },
  ],
  steps: [
    { icon: 'FileText', title: 'Connect your knowledge', description: 'Add sources once. Changes are re-indexed automatically and every answer cites where it came from.' },
    { icon: 'Terminal', title: 'Version every prompt', description: 'Compare prompt versions side by side, roll back instantly and see cost and latency per change.' },
    { icon: 'BarChart3', title: 'Measure what matters', description: 'Track groundedness, refusal rate and user feedback so quality never regresses silently.' },
  ],
  bento: [
    { icon: 'ShieldCheck', title: 'Private by default', description: 'Tenant-isolated indexes and configurable retention keep sensitive content where it belongs.', span: 'wide' as const },
    { icon: 'Zap', title: 'Low latency', description: 'Streaming responses with caching on hot queries.' },
    { icon: 'KeyRound', title: 'Bring your own keys', description: 'Use your model provider accounts and spending limits.' },
    { icon: 'Webhook', title: 'Webhooks and API', description: 'Trigger workflows when evaluations fail or new sources sync.', span: 'wide' as const },
  ],
  stats: [
    { value: '<400ms', label: 'median retrieval' },
    { value: '99.9%', label: 'uptime target' },
    { value: '40+', label: 'source connectors' },
    { value: 'SOC 2', label: 'in progress' },
  ],
  tiers: [
    { name: 'Builder', price: '$0', period: '/ month', description: 'Explore with one workspace.', features: ['1 workspace', '10k documents', 'Community support'], cta: { label: 'Join waitlist', href: '#' } },
    { name: 'Production', price: '$149', period: '/ month', description: 'For live assistants.', features: ['Unlimited workspaces', '1M documents', 'Evaluation suites', 'Priority support'], cta: { label: 'Request access', href: '#' }, featured: true },
    { name: 'Dedicated', price: 'Custom', description: 'Isolated infrastructure.', features: ['Private deployment', 'SSO and audit export', 'Solution engineer'], cta: { label: 'Talk to us', href: '#' } },
  ],
  faq: [
    { q: 'Which models are supported?', a: 'Any provider with a chat or completion API. Routing and fallbacks are configured per prompt.' },
    { q: 'Where is data stored?', a: 'In your chosen region, with tenant-isolated indexes. Dedicated plans can run in your own cloud account.' },
    { q: 'Can I export my data?', a: 'Yes. Sources, prompts and evaluation results can be exported at any time.' },
  ],
};
