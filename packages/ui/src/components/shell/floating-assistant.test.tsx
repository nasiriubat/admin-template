import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantProvider, FloatingAssistant, useAssistant } from './floating-assistant';

vi.mock('@nexus/theme', () => ({ useTheme: () => ({ resolvedMode: 'light', toggleMode: () => {} }) }));

function Toggle() {
  const a = useAssistant();
  return <button onClick={() => a?.setEnabled(!a.enabled)}>{a?.enabled ? 'on' : 'off'}</button>;
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
});

describe('AssistantProvider', () => {
  it('follows the deployment default until the user chooses, then persists the choice', async () => {
    const user = userEvent.setup();
    render(
      <AssistantProvider enabledByDefault>
        <Toggle />
      </AssistantProvider>,
    );
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('on'));
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('off');
    expect(JSON.parse(localStorage.getItem('nexus_assistant')!).enabled).toBe(false);
  });
  it('respects a default of off', async () => {
    render(
      <AssistantProvider enabledByDefault={false}>
        <Toggle />
      </AssistantProvider>,
    );
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('off'));
  });
  it('ignores corrupt stored data', async () => {
    localStorage.setItem('nexus_assistant', '{nope');
    render(
      <AssistantProvider enabledByDefault>
        <Toggle />
      </AssistantProvider>,
    );
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('on'));
  });
});

describe('FloatingAssistant', () => {
  const actions = [{ id: 'a', label: 'Do thing', icon: 'Search', onSelect: vi.fn() }];

  it('opens a menu of actions by keyboard and runs one', async () => {
    const user = userEvent.setup();
    render(<FloatingAssistant actions={actions} />);
    const trigger = await screen.findByRole('button', { name: 'Quick actions assistant' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name: /Do thing/ }));
    expect(actions[0].onSelect).toHaveBeenCalledOnce();
  });

  it('offers non-drag ways to move it and a way to hide it', async () => {
    const user = userEvent.setup();
    render(<FloatingAssistant actions={actions} />);
    await user.click(await screen.findByRole('button', { name: 'Quick actions assistant' }));
    await user.click(await screen.findByRole('button', { name: 'Top left' }));
    expect(JSON.parse(localStorage.getItem('nexus_assistant')!)).toMatchObject({ side: 'left', y: 0.15 });
    await user.click(screen.getByRole('button', { name: /Hide assistant/ }));
    expect(JSON.parse(localStorage.getItem('nexus_assistant')!).enabled).toBe(false);
  });

  it('shows keyboard shortcuts in a dialog', async () => {
    const user = userEvent.setup();
    render(<FloatingAssistant actions={[]} />);
    await user.click(await screen.findByRole('button', { name: 'Quick actions assistant' }));
    await user.click(await screen.findByRole('button', { name: /Keyboard shortcuts/ }));
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    await act(async () => {});
  });
});
