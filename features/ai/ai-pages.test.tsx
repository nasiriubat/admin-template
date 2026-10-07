import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter, DEMO_USERS } from '@nexus/auth';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/ai' }));
vi.mock('gsap', () => ({ gsap: { registerPlugin: () => undefined } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('recharts', async () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return new Proxy({}, { get: () => Stub });
});

import { AiModelsPage } from './ai-models-page';
import { AiPromptsPage } from './ai-prompts-page';
import { AiProvidersPage } from './ai-providers-page';
import { AiUsagePage } from './ai-usage-page';

function wrap(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={adminAdapter}>{node}</AuthProvider>
    </QueryClientProvider>,
  );
}
const T = { timeout: 4000 };
const adminAdapter = { ...createDemoAuthAdapter(), getSession: async () => ({ user: DEMO_USERS[0], expiresAt: '2999-01-01T00:00:00Z' }) };

describe('AiProvidersPage', () => {
  it('lists providers with masked keys only', async () => {
    wrap(<AiProvidersPage />);
    await waitFor(() => expect(screen.getAllByText('Anthropic').length).toBeGreaterThan(0), T);
    expect(screen.getAllByText('sk-ant••••M2zD').length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/sk-ant-[A-Za-z0-9]{10,}/);
  });

  it('validates the https base URL in the add dialog', async () => {
    wrap(<AiProvidersPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Add provider/ }, T));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/^Name/), { target: { value: 'Acme AI' } });
    fireEvent.change(within(dialog).getByLabelText(/Base URL/), { target: { value: 'http://insecure.example.com' } });
    fireEvent.change(within(dialog).getByLabelText(/^API key/), { target: { value: 'abcdefgh12345' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add provider' }));
    expect(await within(dialog).findByText('Enter a valid https:// URL.')).toBeTruthy();
  });

  it('requires typing the provider name to delete it', async () => {
    wrap(<AiProvidersPage />);
    await waitFor(() => expect(screen.getAllByText('Partner gateway').length).toBeGreaterThan(0), T);
    fireEvent.pointerDown(screen.getAllByLabelText('Actions for Partner gateway')[0], { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByText(/Delete…/));
    const dialog = await screen.findByRole('alertdialog');
    expect((within(dialog).getByRole('button', { name: 'Delete provider' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('AiModelsPage', () => {
  it('shows pricing and capabilities with default toggles', async () => {
    wrap(<AiModelsPage />);
    await waitFor(() => expect(screen.getAllByText('Claude Sonnet').length).toBeGreaterThan(0), T);
    expect(screen.getAllByText('vision').length).toBeGreaterThan(0);
    const button = screen.getAllByLabelText('Use GPT-4o as default chat model')[0];
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('AiPromptsPage', () => {
  it('opens the editor, detects variables and renders a test run', async () => {
    wrap(<AiPromptsPage />);
    const open = (await screen.findAllByText('Release notes summary', {}, T))[0];
    fireEvent.click(open);
    const sheet = await screen.findByRole('dialog');
    const group = within(sheet).getByRole('group', { name: 'Detected variables' });
    expect(within(group).getByText('{{audience}}')).toBeTruthy();
    fireEvent.change(within(sheet).getByLabelText('audience'), { target: { value: 'admins' } });
    expect(within(sheet).getByTestId('rendered-prompt').textContent).toContain('for admins in three bullet points');
    expect(within(sheet).getByText(/Version history/)).toBeTruthy();
  });
});

describe('AiUsagePage', () => {
  it('renders metrics, consumers and the range control', async () => {
    wrap(<AiUsagePage />);
    expect((await screen.findAllByText('Support reply drafter', {}, T)).length).toBeGreaterThan(0);
    expect(screen.getByRole('radiogroup', { name: 'Date range' })).toBeTruthy();
    expect(screen.getAllByText('Estimated cost').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByLabelText('7 days'));
    await waitFor(() => expect(screen.getAllByText('Support reply drafter').length).toBeGreaterThan(0));
  });
});
