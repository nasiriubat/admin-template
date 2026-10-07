import type { PricingTier } from '@nexus/ui/marketing';

/** Copy and illustrative data for the Product template (/product). All figures are sample data. */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'primary';

export interface DashModule {
  id: string;
  title: string;
  nav: string[];
  kpis: Array<{ label: string; value: string; delta: string; tone: Tone }>;
  /** 0-100 values for the sparkline. */
  series: number[];
  rows: Array<{ name: string; meta: string; status: string; tone: Tone }>;
}

export const overviewModule: DashModule = {
  id: 'overview',
  title: 'Overview',
  nav: ['Overview', 'Orders', 'People', 'Insights', 'Settings'],
  kpis: [
    { label: 'Revenue', value: '$48.2k', delta: '+12%', tone: 'success' },
    { label: 'Orders', value: '1,284', delta: '+8%', tone: 'success' },
    { label: 'Refunds', value: '23', delta: '-4%', tone: 'info' },
  ],
  series: [22, 30, 26, 38, 34, 46, 42, 58, 52, 66, 61, 78],
  rows: [
    { name: 'Northwind order 4821', meta: 'Today, 09:12', status: 'Paid', tone: 'success' },
    { name: 'Lumen order 4820', meta: 'Today, 08:47', status: 'Pending', tone: 'warning' },
    { name: 'Parcel order 4819', meta: 'Yesterday', status: 'Refunded', tone: 'info' },
  ],
};

export interface PhoneScreenData {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  header: string;
  items: Array<{ title: string; meta: string; badge: string; tone: Tone }>;
  nav: Array<{ icon: string; label: string }>;
  activeNav: number;
}

const nav = [
  { icon: 'LayoutDashboard', label: 'Home' },
  { icon: 'ShoppingCart', label: 'Orders' },
  { icon: 'Users', label: 'People' },
  { icon: 'Bell', label: 'Alerts' },
];

export const phoneScreens: PhoneScreenData[] = [
  {
    id: 'orders',
    icon: 'ShoppingCart',
    title: 'Orders',
    tagline: 'Tables become records',
    description: 'Every row turns into a readable card on a phone, with the same filters in a bottom sheet.',
    header: 'Orders',
    items: [
      { title: 'Order 4821', meta: 'Northwind, $320.00', badge: 'Paid', tone: 'success' },
      { title: 'Order 4820', meta: 'Lumen, $89.50', badge: 'Pending', tone: 'warning' },
      { title: 'Order 4819', meta: 'Parcel, $1,040.00', badge: 'Refunded', tone: 'info' },
    ],
    nav,
    activeNav: 1,
  },
  {
    id: 'people',
    icon: 'Users',
    title: 'People',
    tagline: 'Roles in your pocket',
    description: 'Invite teammates, change roles and review access from the same permission-aware screens.',
    header: 'Team',
    items: [
      { title: 'Amira Haddad', meta: 'Owner', badge: 'Active', tone: 'success' },
      { title: 'Tomas Novak', meta: 'Editor', badge: 'Active', tone: 'success' },
      { title: 'Riley Nguyen', meta: 'Viewer', badge: 'Invited', tone: 'warning' },
    ],
    nav,
    activeNav: 2,
  },
  {
    id: 'alerts',
    icon: 'Bell',
    title: 'Alerts',
    tagline: 'Know before they do',
    description: 'Notifications group by severity and link straight to the record that needs attention.',
    header: 'Alerts',
    items: [
      { title: 'Payment retries failing', meta: '3 minutes ago', badge: 'High', tone: 'danger' },
      { title: 'New sign-in from Berlin', meta: '1 hour ago', badge: 'Review', tone: 'warning' },
      { title: 'Weekly report ready', meta: 'Today', badge: 'Info', tone: 'info' },
    ],
    nav,
    activeNav: 3,
  },
  {
    id: 'home',
    icon: 'LayoutDashboard',
    title: 'Home',
    tagline: 'The day at a glance',
    description: 'Key numbers, a trend line and the three things that need you first.',
    header: 'Today',
    items: [
      { title: 'Revenue', meta: '$48.2k this week', badge: '+12%', tone: 'success' },
      { title: 'Open tickets', meta: '14 waiting', badge: '-3', tone: 'info' },
      { title: 'Failed jobs', meta: 'Last run 06:00', badge: '1', tone: 'danger' },
    ],
    nav,
    activeNav: 0,
  },
];

export const zoomCaptions = [
  { title: 'The whole workspace', body: 'Navigation, numbers and activity share one calm layout.' },
  { title: 'One module, in detail', body: 'Zoom into revenue and every figure, filter and state is already designed.' },
  { title: 'Everything stays connected', body: 'Step back out and the same tokens hold the rest of the product together.' },
];

export const metrics = [
  { value: 14, suffix: '', label: 'ready-made modules', fraction: 0.7 },
  { value: 5, suffix: '', label: 'theme presets', fraction: 0.5 },
  { value: 100, suffix: '%', label: 'token-driven colour', fraction: 1 },
  { value: 4.5, suffix: ':1', label: 'minimum text contrast', decimals: 1, fraction: 0.85 },
];

export const integrationNames = [
  { name: 'REST APIs', icon: 'Server' },
  { name: 'PostgreSQL', icon: 'Database' },
  { name: 'Webhooks', icon: 'Webhook' },
  { name: 'OIDC and SAML', icon: 'KeyRound' },
  { name: 'Email delivery', icon: 'Mail' },
  { name: 'Object storage', icon: 'FolderOpen' },
  { name: 'Payments', icon: 'CreditCard' },
  { name: 'Metrics export', icon: 'Activity' },
  { name: 'Search', icon: 'Search' },
  { name: 'Job queues', icon: 'Terminal' },
];

export const whatsNew = [
  { date: 'This month', title: 'Workflows module', description: 'Build approval flows and scheduled automations with a visual editor that follows your permissions.' },
  { date: 'Last month', title: 'Floating assistant', description: 'A keyboard-friendly helper that answers questions and jumps to any page from anywhere in the app.' },
  { date: 'Earlier this year', title: 'Landing page templates', description: 'Five marketing templates built from the same tokens, so your site and your product match.' },
  { date: 'Earlier this year', title: 'Installable PWA', description: 'Home-screen install and an offline fallback for the admin, with no extra setup.' },
];

export const productTiers: PricingTier[] = [
  { name: 'Starter', price: '$0', period: '/ forever', description: 'Everything to try the product.', features: ['Admin shell and theme engine', '5 core modules', 'Community support'], cta: { label: 'Start free', href: '/pricing' } },
  { name: 'Team', price: '$49', period: '/ month', description: 'For products with real users.', features: ['All 14 modules', 'Landing page templates', 'Priority support'], cta: { label: 'Start trial', href: '/pricing' }, featured: true },
  { name: 'Agency', price: '$199', period: '/ month', description: 'One licence for every client.', features: ['Unlimited projects', 'White-label rights', 'Onboarding session'], cta: { label: 'See plans', href: '/pricing' } },
];

export const productFaq = [
  { q: 'Are the screens real or mock-ups?', a: 'The device screens on this page are token-driven illustrations of real modules. They change with your theme and work in light and dark mode.' },
  { q: 'Does it work without JavaScript animation?', a: 'Yes. Every scroll effect is optional. With reduced motion enabled, or on small screens, the page becomes a plain, fully readable stack.' },
  { q: 'Can I remove this template?', a: 'Delete the /product route and its template folder. Nothing else depends on it.' },
  { q: 'Which backends does it support?', a: 'Any backend that follows the documented response envelope, including FastAPI, Laravel, Django, Node and Go.' },
];

export const productLinks = [
  { label: 'Story', href: '#story' },
  { label: 'Screens', href: '#screens' },
  { label: 'Mobile', href: '#mobile' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];
