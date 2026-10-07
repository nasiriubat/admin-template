import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryBoundary } from '../patterns/query-boundary';
import { FormField } from '../forms/form-field';
import { Button } from './button';
import { ConfirmDialog } from './dialog';
import { Input } from './input';

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
  it('defaults to type=button so it never submits a form by accident', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});

describe('FormField', () => {
  it('links label, hint and error to the control', () => {
    render(
      <FormField label="Email" hint="We never share it" error="Enter a valid email" required>
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  });
});

function Harness({ onConfirm, requireText }: { onConfirm: () => void; requireText?: string }) {
  const [open, setOpen] = useState(true);
  return <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete item?" description="This cannot be undone." requireText={requireText} onConfirm={onConfirm} />;
}

describe('ConfirmDialog', () => {
  it('focuses Cancel, not the destructive action', async () => {
    render(<Harness onConfirm={() => {}} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });
  it('requires the typed phrase before confirming', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<Harness onConfirm={onConfirm} requireText="DELETE" />);
    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText(/type/i), 'DELETE');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });
  it('shows an error and stays open if the action fails', async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={() => { throw new Error('Server said no'); }} requireText="X" />);
    await user.type(screen.getByLabelText(/type/i), 'X');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Server said no')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});

describe('QueryBoundary', () => {
  const base = { data: undefined, isPending: false, isError: false, error: null, refetch: vi.fn() };
  it('renders each required page state', () => {
    const { rerender } = render(<QueryBoundary query={{ ...base, isPending: true }} loading={<p>skeleton</p>}>{() => <p>loaded</p>}</QueryBoundary>);
    expect(screen.getByText('skeleton')).toBeInTheDocument();

    rerender(<QueryBoundary query={{ ...base, data: [] }} loading={null} empty={<p>nothing</p>} isEmpty={(d: unknown[]) => d.length === 0}>{() => <p>loaded</p>}</QueryBoundary>);
    expect(screen.getByText('nothing')).toBeInTheDocument();

    rerender(<QueryBoundary query={{ ...base, data: [1] }} loading={null}>{(d: number[]) => <p>loaded {d.length}</p>}</QueryBoundary>);
    expect(screen.getByText('loaded 1')).toBeInTheDocument();

    rerender(<QueryBoundary query={{ ...base, isError: true, error: { status: 500, message: 'boom' } }} loading={null}>{() => null}</QueryBoundary>);
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    rerender(<QueryBoundary query={{ ...base, isError: true, error: { status: 403 } }} loading={null}>{() => null}</QueryBoundary>);
    expect(screen.getByText(/don’t have access/i)).toBeInTheDocument();
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  });
});

describe('ConfirmDialog reopen', () => {
  it('clears the typed phrase after a confirmed action so reopening is not pre-satisfied', async () => {
    const user = userEvent.setup();
    function Reopen() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>reopen</button>
          <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete?" description="x" requireText="DELETE" onConfirm={() => {}} />
        </>
      );
    }
    render(<Reopen />);
    await user.type(screen.getByLabelText(/type/i), 'DELETE');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByText('reopen'));
    expect(await screen.findByLabelText(/type/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
