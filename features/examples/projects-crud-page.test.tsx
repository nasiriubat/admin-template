import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProjectsCrudPage } from './projects-crud-page';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ProjectsCrudPage />
    </QueryClientProvider>,
  );
}
const T = { timeout: 4000 };

describe('ProjectsCrudPage', () => {
  it('shows the example banner and lists projects from the mock API', async () => {
    renderPage();
    expect(screen.getByRole('region', { name: /example page/i })).toBeInTheDocument();
    expect((await screen.findAllByText('Atlas migration', undefined, T)).length).toBeGreaterThan(0);
  });

  it('validates the create dialog and surfaces the server duplicate-name error', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Atlas migration', undefined, T);
    await user.click(screen.getAllByRole('button', { name: /new project/i })[0]);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));
    expect(await within(dialog).findByText('Enter at least 2 characters.')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/^Name/), 'Atlas migration');
    await user.type(within(dialog).getByLabelText(/^Owner/), 'Sam Rivera');
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));
    expect(await within(dialog).findByText('A project with this name already exists.', undefined, T)).toBeInTheDocument();
  });

  it('creates a project and then finds it', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Atlas migration', undefined, T);
    await user.click(screen.getAllByRole('button', { name: /new project/i })[0]);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Name/), 'Brand new thing');
    await user.type(within(dialog).getByLabelText(/^Owner/), 'Quinn Lee');
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), T);
    expect((await screen.findAllByText('Brand new thing', undefined, T)).length).toBeGreaterThan(0);
  });

  it('requires an explicit confirmation to delete, with Cancel focused', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Atlas migration', undefined, T);
    await user.click(screen.getAllByRole('button', { name: 'Actions for Atlas migration' })[0]);
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));
    const dialog = await screen.findByRole('alertdialog');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus());
    await user.click(within(dialog).getByRole('button', { name: 'Delete project' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), T);
    await waitFor(() => expect(screen.queryAllByText('Atlas migration')).toHaveLength(0), T);
  });
});
