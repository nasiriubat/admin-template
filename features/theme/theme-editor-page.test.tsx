import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@nexus/theme';
import { ThemeEditorPage } from './theme-editor-page';

const renderPage = () =>
  render(
    <ThemeProvider>
      <ThemeEditorPage />
    </ThemeProvider>,
  );

describe('ThemeEditorPage', () => {
  it('renders controls, preview and a contrast readout with pass/fail badges', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Live preview' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Contrast ratio per token pair' })).toBeTruthy();
    expect(screen.getAllByText(/^(Pass|Fail)$/).length).toBeGreaterThan(5);
    expect(screen.getByRole('button', { name: /Reset to defaults/ })).toBeTruthy();
  });

  it('switches preset and updates the contrast readout caption', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('radio', { name: 'Professional' }));
    await waitFor(() => expect(screen.getByText(/Professional,/)).toBeTruthy());
  });

  it('shows an error alert for an invalid import file and accepts a valid one', async () => {
    renderPage();
    const input = screen.getByTestId('theme-import') as HTMLInputElement;
    const bad = new File(['{not json'], 'bad.json', { type: 'application/json' });
    Object.defineProperty(bad, 'text', { value: async () => '{not json' });
    fireEvent.change(input, { target: { files: [bad] } });
    expect(await screen.findByText('This file is not valid JSON.')).toBeTruthy();

    const body = JSON.stringify({ version: 1, theme: { preset: 'professional', mode: 'dark' } });
    const good = new File([body], 'theme.json', { type: 'application/json' });
    Object.defineProperty(good, 'text', { value: async () => body });
    fireEvent.change(input, { target: { files: [good] } });
    await waitFor(() => expect(screen.getByText(/Professional,.*dark mode/)).toBeTruthy());
    expect(screen.queryByText('This file is not valid JSON.')).toBeNull();
  });
});
