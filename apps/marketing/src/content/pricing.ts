import type { MatrixGroup, PlanDef } from '@nexus/ui';

export const plans: PlanDef[] = [
  { id: 'starter', name: 'Starter', description: 'For side projects and prototypes.', monthly: 0, yearly: 0, highlights: ['Admin shell and theme engine', '5 core modules', 'Community support'], cta: { label: 'Get started', href: '/contact' } },
  { id: 'team', name: 'Team', description: 'For products with a real user base.', monthly: 49, yearly: 39, featured: true, highlights: ['All 14 modules', 'Landing page templates', 'Priority email support', 'Private updates'], cta: { label: 'Start free trial', href: '/contact' } },
  { id: 'agency', name: 'Agency', description: 'Reuse across every client project.', monthly: 199, yearly: 159, highlights: ['Unlimited projects', 'White-label rights', 'Onboarding session', 'Shared component library'], cta: { label: 'Choose Agency', href: '/contact' } },
  { id: 'enterprise', name: 'Enterprise', description: 'For regulated and large organisations.', monthly: null, yearly: null, highlights: ['Single sign-on and SCIM', 'Security review support', 'Custom service agreement'], cta: { label: 'Talk to sales', href: '/contact' } },
];

const v = (starter: boolean | string, team: boolean | string, agency: boolean | string, enterprise: boolean | string) => ({ starter, team, agency, enterprise });

export const matrix: MatrixGroup[] = [
  {
    title: 'Platform',
    rows: [
      { label: 'Admin shell, themes and dark mode', values: v(true, true, true, true) },
      { label: 'Ready-made modules', values: v('5', '14', '14', '14 + custom') },
      { label: 'Projects', values: v('1', '3', 'Unlimited', 'Unlimited') },
      { label: 'Landing page templates', values: v(false, true, true, true) },
    ],
  },
  {
    title: 'Security and access',
    rows: [
      { label: 'Roles and permissions', values: v(true, true, true, true) },
      { label: 'Audit log', values: v(false, true, true, true) },
      { label: 'Single sign-on (SAML, OIDC)', values: v(false, false, false, true) },
      { label: 'Security questionnaire support', values: v(false, false, true, true) },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Community forum', values: v(true, true, true, true) },
      { label: 'Email support response', values: v(false, '2 business days', '1 business day', '4 hours') },
      { label: 'Onboarding session', values: v(false, false, true, true) },
      { label: 'Custom service agreement', values: v(false, false, false, true) },
    ],
  },
];

export const pricingFaq = [
  { q: 'Can I switch between monthly and yearly billing?', a: 'Yes. You can change the billing cycle at any renewal. Yearly plans are billed once per year at the discounted monthly rate shown.' },
  { q: 'What happens when I outgrow a plan?', a: 'Upgrade at any time and you are charged only the prorated difference for the rest of the billing period.' },
  { q: 'Do you offer discounts for non-profits or education?', a: 'Yes. Contact us with your organisation details and we will apply a discount to the Team plan.' },
  { q: 'Can I use Nexus for client projects?', a: 'The Agency plan includes white-label rights, so you can ship the framework inside client products.' },
  { q: 'Which payment methods are accepted?', a: 'Major credit cards, plus invoicing with bank transfer on the Agency and Enterprise plans.' },
];
