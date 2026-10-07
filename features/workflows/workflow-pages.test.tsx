import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter, DEMO_USERS } from '@nexus/auth';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/workflows' }));
vi.mock('../_shared/register-mocks', async () => {
  await import('./mock');
  return {};
});

import { WorkflowRunsPage } from './workflow-runs-page';
import { WorkflowsPage } from './workflows-page';

const T = { timeout: 5000 };
const adapterFor = (index: number) => ({ ...createDemoAuthAdapter(), getSession: async () => ({ user: DEMO_USERS[index], expiresAt: '2999-01-01T00:00:00Z' }) });

const findName = (name: string) => screen.findAllByText(name, undefined, T);

function wrap(node: ReactNode, userIndex = 0) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={adapterFor(userIndex)}>{node}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe('WorkflowsPage', () => {
  it('lists workflows with status, trigger and template gallery', async () => {
    wrap(<WorkflowsPage />);
    expect(await screen.findByRole('table', { name: 'Agent workflows' }, T)).toBeInTheDocument();
    expect(await findName('Support ticket triage')).not.toHaveLength(0);
    expect(screen.getByText('Start from a template')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use the RAG Q&A agent template' })).toBeInTheDocument();
  });

  it('opens the new workflow dialog with the chosen template and validates the name', async () => {
    const user = userEvent.setup();
    wrap(<WorkflowsPage />);
    await findName('Support ticket triage');
    await user.click(screen.getByRole('button', { name: 'Use the Daily digest template' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('radio', { name: /Daily digest/ })).toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Create workflow' }));
    expect(await within(dialog).findByText('Name must be at least 2 characters.')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    wrap(<WorkflowsPage />);
    await findName('Support ticket triage');
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'draft');
    await waitFor(() => expect(screen.queryAllByText('Support ticket triage')).toHaveLength(0), T);
    expect(await findName('Release notes writer')).not.toHaveLength(0);
  });

  it('requires typing the workflow name before deleting', async () => {
    const user = userEvent.setup();
    wrap(<WorkflowsPage />);
    await findName('Support ticket triage');
    await user.click((await screen.findAllByRole('button', { name: /^Actions for / }))[0]);
    await user.click(await screen.findByRole('menuitem', { name: /Delete/ }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByRole('button', { name: 'Delete workflow' })).toBeDisabled();
  });

  it('hides write actions without workflows.manage', async () => {
    wrap(<WorkflowsPage />, 2);
    await findName('Support ticket triage');
    expect(screen.queryByRole('button', { name: 'New workflow' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Use the Blank template' })).toBeDisabled();
  });
});

describe('WorkflowRunsPage', () => {
  it('shows metrics and the runs table', async () => {
    wrap(<WorkflowRunsPage />);
    expect(await screen.findByRole('table', { name: 'Workflow runs' }, T)).toBeInTheDocument();
    expect(await screen.findByText('Success rate', undefined, T)).toBeInTheDocument();
    expect(screen.getByText('Runs (24h)')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-refresh')).toBeChecked();
  });

  it('offers approve and reject for runs awaiting approval, with confirmation for reject', async () => {
    const user = userEvent.setup();
    wrap(<WorkflowRunsPage />);
    await screen.findByRole('table', { name: 'Workflow runs' }, T);
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'awaiting-approval');
    const reject = (await screen.findAllByRole('button', { name: /^Reject run/ }, T))[0];
    expect(screen.getAllByRole('button', { name: /^Approve run/ }).length).toBeGreaterThan(0);
    await user.click(reject);
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/Nothing after the approval step will execute/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Keep waiting' }));
  });

  it('asks before cancelling a running run', async () => {
    const user = userEvent.setup();
    wrap(<WorkflowRunsPage />);
    await screen.findByRole('table', { name: 'Workflow runs' }, T);
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'running');
    await user.click((await screen.findAllByRole('button', { name: /^Cancel run/ }, T))[0]);
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });

  it('hides run actions for viewers', async () => {
    wrap(<WorkflowRunsPage />, 2);
    await screen.findByRole('table', { name: 'Workflow runs' }, T);
    await screen.findAllByText(/^run_/, undefined, T);
    expect(screen.queryByRole('button', { name: /^(Retry|Cancel|Approve|Reject) run/ })).toBeNull();
  });
});
