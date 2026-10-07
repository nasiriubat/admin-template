import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContactForm } from './contact-form';
import { buildMailto, consumeRateLimit, contactSchema } from './contact-schema';
import { PricingPlans } from './pricing-plans';
import { formatPrice, maxSavingsPercent, yearlySavingsPercent, type MatrixGroup, type PlanDef } from './pricing-utils';
import { ContentBlocks, extractHeadings, slugify } from './prose';
import { ReleaseTimeline } from './timeline';

const plans: PlanDef[] = [
  { id: 'a', name: 'Free', description: 'd', monthly: 0, yearly: 0, highlights: ['x'], cta: { label: 'Go', href: '/a' } },
  { id: 'b', name: 'Pro', description: 'd', monthly: 50, yearly: 40, featured: true, highlights: ['y'], cta: { label: 'Buy', href: '/b' } },
  { id: 'c', name: 'Corp', description: 'd', monthly: null, yearly: null, highlights: ['z'], cta: { label: 'Talk', href: '/c' } },
];
const groups: MatrixGroup[] = [{ title: 'Core', rows: [{ label: 'SSO', values: { a: false, b: false, c: true } }, { label: 'Seats', values: { a: '1', b: '10', c: 'Unlimited' } }] }];

describe('pricing utils', () => {
  it('computes savings and formats prices', () => {
    expect(yearlySavingsPercent(plans[1])).toBe(20);
    expect(yearlySavingsPercent(plans[0])).toBe(0);
    expect(maxSavingsPercent(plans)).toBe(20);
    expect(formatPrice(null)).toBe('Custom');
    expect(formatPrice(1200)).toBe('$1,200');
  });
});

describe('PricingPlans', () => {
  it('toggles between yearly and monthly prices with an accessible switch', () => {
    render(<PricingPlans plans={plans} groups={groups} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    expect(screen.getByText('$40')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Most popular')).toBeInTheDocument();
  });
  it('exposes text alternatives for matrix cells', () => {
    render(<PricingPlans plans={plans} groups={groups} />);
    expect(screen.getAllByText('Included').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not included').length).toBeGreaterThan(0);
  });
});

describe('contact schema', () => {
  const valid = { name: 'Ada Lovelace', email: 'ada@example.com', topic: 'sales', message: 'I would like a demo for my team please.', consent: true };
  it('accepts valid input and rejects bad email, short message and missing consent', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: 'short' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, website: 'spam' }).success).toBe(false);
  });
  it('rate limits after the maximum within the window and recovers later', () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    for (let i = 0; i < 3; i++) expect(consumeRateLimit(storage, 1000 + i).allowed).toBe(true);
    const blocked = consumeRateLimit(storage, 2000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(consumeRateLimit(storage, 1000 + 11 * 60 * 1000).allowed).toBe(true);
  });
  it('builds an encoded mailto link', () => {
    const url = buildMailto('hi@example.com', { name: 'A B', email: 'a@b.co', topic: 'sales', message: 'Hello & welcome' });
    expect(url.startsWith('mailto:hi@example.com?subject=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Hello & welcome'));
  });
});

describe('ContactForm', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm endpoint="https://example.com/api" fallbackEmail="hi@example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText(/Enter your name/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it('POSTs JSON without the honeypot and shows success', async () => {
    localStorage.clear();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm endpoint="https://example.com/api" fallbackEmail="hi@example.com" />);
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText(/Work email/), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'I would like a demo for my team please.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Message sent')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/api');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', topic: 'sales' });
    expect(body).not.toHaveProperty('website');
    vi.unstubAllGlobals();
  });
  it('shows an error state when the endpoint fails', async () => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    render(<ContactForm endpoint="https://example.com/api" fallbackEmail="hi@example.com" />);
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText(/Work email/), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'I would like a demo for my team please.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText('Message not sent')).toBeInTheDocument());
    vi.unstubAllGlobals();
  });
});

describe('prose and timeline', () => {
  it('slugifies and extracts h2 headings', () => {
    expect(slugify('Install `pnpm` & run!')).toBe('install-pnpm-run');
    expect(extractHeadings([{ type: 'h2', text: 'One' }, { type: 'p', text: 'x' }, { type: 'h3', text: 'Skip' }])).toEqual([{ id: 'one', title: 'One' }]);
  });
  it('renders inline code and headings with ids', () => {
    render(<ContentBlocks blocks={[{ type: 'h2', text: 'Setup' }, { type: 'p', text: 'Run `pnpm dev` now' }]} />);
    expect(screen.getByRole('heading', { name: 'Setup' })).toHaveAttribute('id', 'setup');
    expect(screen.getByText('pnpm dev').tagName).toBe('CODE');
  });
  it('renders releases with tags', () => {
    render(<ReleaseTimeline releases={[{ version: '1.0.0', date: '2026-03-02', summary: 's', changes: [{ type: 'Fixed', text: 'A bug' }] }]} />);
    expect(screen.getByRole('heading', { name: 'v1.0.0' })).toBeInTheDocument();
    expect(screen.getByText('Fixed')).toBeInTheDocument();
    expect(screen.getByText('March 2, 2026')).toBeInTheDocument();
  });
});
