import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter, DEMO_USERS } from '@nexus/auth';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/workflows' }));
vi.mock('../_shared/register-mocks', async () => {
  await import('./mock');
  await import('../ai/mock');
  return {};
});

import { WorkflowBuilderPage } from './workflow-builder-page';

const T = { timeout: 5000 };
const adapterFor = (index: number) => ({ ...createDemoAuthAdapter(), getSession: async () => ({ user: DEMO_USERS[index], expiresAt: '2999-01-01T00:00:00Z' }) });

beforeAll(() => {
  // jsdom lacks the matrix API React Flow reads, and reports no viewport: pretend to be a desktop.
  (globalThis as unknown as { DOMMatrixReadOnly: unknown }).DOMMatrixReadOnly = class { m22 = 1; };
  window.matchMedia = ((query: string) => ({ matches: query.includes('min-width: 1024px'), media: query, addEventListener: () => undefined, removeEventListener: () => undefined, addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false, onchange: null })) as typeof window.matchMedia;
});

function renderBuilder(id: string, userIndex = 0) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={adapterFor(userIndex)}>
        <WorkflowBuilderPage id={id} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('WorkflowBuilderPage', () => {
  it('adds a node from the palette, lists it in the outline, connects it by select and reports validation errors', async () => {
    const user = userEvent.setup();
    renderBuilder('wf-009');
    expect(await screen.findByLabelText('Workflow name', undefined, T)).toHaveValue('Release notes writer');

    await user.click(screen.getByRole('button', { name: 'Add LLM Call node' }));
    await user.click(screen.getByRole('tab', { name: 'Outline' }));

    const outline = screen.getByRole('region', { name: 'Workflow outline' });
    const llmItem = within(outline).getByRole('heading', { name: 'LLM Call' }).closest('li') as HTMLElement;
    expect(llmItem).toBeInTheDocument();

    // Keyboard-only connection: Start -> LLM Call using the "Connect to" select.
    await user.selectOptions(within(outline).getByLabelText('Connect Start to…'), 'LLM Call');
    await user.click(within(outline).getByRole('button', { name: 'Connect Start' }));
    const startItem = within(outline).getByRole('heading', { name: 'Start' }).closest('li') as HTMLElement;
    await waitFor(() => expect(within(startItem).getByText('LLM Call')).toBeInTheDocument());

    // Clearing the prompt in the inspector surfaces an error in the validation panel.
    await user.click(within(llmItem).getByRole('button', { name: /LLM Call to edit its settings/ }));
    const prompt = await screen.findByLabelText(/Prompt template/);
    await user.clear(prompt);
    expect(await screen.findByText(/"LLM Call" needs attention/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Validation \(\d+\)/ })).toBeInTheDocument();
  });

  it('refuses a second trigger', async () => {
    renderBuilder('wf-009');
    await screen.findByLabelText('Workflow name', undefined, T);
    expect(screen.getByRole('button', { name: 'Add Trigger node' })).toBeDisabled();
  });

  it('is read-only without workflows.manage', async () => {
    renderBuilder('wf-009', 2);
    expect(await screen.findByText('View-only access', undefined, T)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add LLM Call node' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.getByLabelText('Workflow name')).toHaveAttribute('readonly');
  });

  it('shows an error state when the workflow does not exist', async () => {
    renderBuilder('wf-missing');
    expect(await screen.findByText(/Something went wrong/, undefined, T)).toBeInTheDocument();
  });

  it('asks for confirmation before deleting a node from the outline', async () => {
    const user = userEvent.setup();
    renderBuilder('wf-009');
    await screen.findByLabelText('Workflow name', undefined, T);
    await user.click(screen.getByRole('tab', { name: 'Outline' }));
    await user.click(screen.getByRole('button', { name: 'Delete Result' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/Delete 1 node\?/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Result' })).toBeInTheDocument();
  });
});
