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
  heroWords: ['trust', 'trace', 'verify', 'ship'],
  stats: [
    { value: 400, prefix: '<', suffix: 'ms', label: 'median retrieval' },
    { value: 99.9, decimals: 1, suffix: '%', label: 'uptime target' },
    { value: 40, suffix: '+', label: 'source connectors' },
    { value: 100, suffix: '%', label: 'answers carry citations' },
  ],
  pipeline: [
    { id: 'ingest', label: 'Ingest', description: 'Sync sources on a schedule', icon: 'Download' },
    { id: 'chunk', label: 'Chunk', description: 'Structure-aware splitting', icon: 'Layers' },
    { id: 'embed', label: 'Embed', description: 'Versioned embedding models', icon: 'Cpu' },
    { id: 'retrieve', label: 'Retrieve', description: 'Hybrid vector and keyword search', icon: 'Search' },
    { id: 'generate', label: 'Generate', description: 'Prompts, guardrails, routing', icon: 'Sparkles' },
    { id: 'evaluate', label: 'Evaluate', description: 'Regression suites on every release', icon: 'Activity' },
  ],
  features: [
    { icon: 'ShieldCheck', title: 'Private by default', description: 'Tenant-isolated indexes and configurable retention keep sensitive content where it belongs.' },
    { icon: 'Zap', title: 'Low latency', description: 'Streaming responses with caching on hot queries.' },
    { icon: 'KeyRound', title: 'Bring your own keys', description: 'Use your model provider accounts and spending limits.' },
    { icon: 'Webhook', title: 'Webhooks and API', description: 'Trigger workflows when evaluations fail or new sources sync.' },
    { icon: 'FileText', title: 'Cited answers', description: 'Every answer links back to the passages it was built from.' },
    { icon: 'BarChart3', title: 'Quality dashboards', description: 'Groundedness, refusal rate and user feedback over time.' },
  ],
  integrations: ['Wikis', 'Support tickets', 'Code repositories', 'SQL databases', 'Drive folders', 'Chat archives', 'PDF libraries', 'Object storage', 'Chat models', 'Embedding models', 'Rerankers', 'Self-hosted models'],
  snippet: `import { Nexus } from '@nexus-ai/sdk';

const nexus = new Nexus({ apiKey: process.env.NEXUS_API_KEY });

const answer = await nexus.ask({
  workspace: 'support-docs',
  prompt: 'refund-policy@v3',
  question: 'Can I get a refund after 30 days?',
  cite: true,
});

console.log(answer.text);
console.log(answer.sources.map((s) => s.title));`,
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
