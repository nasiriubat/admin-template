import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Banner } from './banner';
import { CodeViewer } from './code-viewer';
import { Combobox, MultiSelect } from './combobox';
import { DateRangeInput, type DateRange } from './date-input';
import { DescriptionList } from './description-list';
import { JsonViewer } from './json-viewer';
import { Kbd } from './kbd';
import { Progress } from './progress';
import { Stepper } from './stepper';
import { TagInput } from './tag-input';
import { ActivityTimeline } from './timeline';

const steps = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Review' },
];

describe('Stepper', () => {
  it('marks only the current step with aria-current and lets completed steps go back', async () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} current={1} onStepClick={onStepClick} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    await userEvent.setup().click(screen.getByRole('button', { name: /account/i }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(screen.queryByRole('button', { name: /review/i })).toBeNull();
  });
});

describe('ActivityTimeline', () => {
  it('renders an ordered list with <time> elements', () => {
    render(<ActivityTimeline items={[{ id: '1', title: 'Created', time: '2026-01-02T03:04:05Z', timeLabel: 'Jan 2' }]} />);
    expect(screen.getByRole('list', { name: 'Activity' }).tagName).toBe('OL');
    expect(screen.getByText('Jan 2').tagName).toBe('TIME');
    expect(screen.getByText('Jan 2')).toHaveAttribute('datetime', '2026-01-02T03:04:05.000Z');
  });
});

describe('DescriptionList', () => {
  it('uses dl/dt/dd and shows a dash for empty values', () => {
    render(<DescriptionList items={[{ label: 'Owner', value: 'Avery' }, { label: 'Region', value: null }]} />);
    expect(screen.getByText('Owner').tagName).toBe('DT');
    expect(screen.getByText('Avery').tagName).toBe('DD');
    expect(screen.getByText('–')).toBeInTheDocument();
  });
});

describe('CodeViewer', () => {
  it('copies the code and confirms it', async () => {
    const user = userEvent.setup();
    render(<CodeViewer code={'a\nb'} language="txt" lineNumbers />);
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe('a\nb');
  });
});

describe('JsonViewer', () => {
  it('toggles branches with the keyboard', async () => {
    const user = userEvent.setup();
    render(<JsonViewer data={{ user: { name: 'Ada' } }} defaultExpandedDepth={1} />);
    expect(screen.queryByText(/Ada/)).toBeNull();
    const toggle = screen.getByRole('button', { name: /user object/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Ada/)).toBeInTheDocument();
  });
});

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

function ComboHarness() {
  const [v, setV] = useState<string | null>(null);
  return <Combobox aria-label="Framework" options={options} value={v} onChange={setV} />;
}
function MultiHarness() {
  const [v, setV] = useState<string[]>([]);
  return <MultiSelect aria-label="Frameworks" options={options} value={v} onChange={setV} />;
}

describe('Combobox', () => {
  it('filters, selects with the keyboard and clears', async () => {
    const user = userEvent.setup();
    render(<ComboHarness />);
    const trigger = screen.getByRole('combobox', { name: 'Framework' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await user.type(screen.getByPlaceholderText('Search…'), 'sve');
    expect(screen.queryByRole('option', { name: 'Vue' })).toBeNull();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('combobox', { name: 'Framework' })).toHaveTextContent('Svelte');
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByRole('combobox', { name: 'Framework' })).toHaveTextContent('Select…');
  });
});

describe('MultiSelect', () => {
  it('shows removable tags', async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'React' }));
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    expect(screen.getByRole('button', { name: 'Remove React' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(screen.queryByRole('button', { name: 'Remove React' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Vue' })).toBeInTheDocument();
  });
});

function RangeHarness({ initial }: { initial: DateRange }) {
  const [v, setV] = useState(initial);
  return <DateRangeInput value={v} onChange={setV} />;
}

describe('DateRangeInput', () => {
  it('shows a validation message when from is after to', () => {
    render(<RangeHarness initial={{ from: '2026-05-10', to: '2026-05-01' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/on or before/i);
    expect(screen.getByLabelText('From')).toHaveAttribute('aria-invalid', 'true');
  });
  it('is quiet for a valid range', () => {
    render(<RangeHarness initial={{ from: '2026-05-01', to: '2026-05-10' }} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('Progress', () => {
  it('exposes progressbar semantics and clamps', () => {
    render(<Progress value={150} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});

describe('Kbd', () => {
  it('renders a kbd element', () => {
    render(<Kbd>⌘K</Kbd>);
    expect(screen.getByText('⌘K').tagName).toBe('KBD');
  });
});

describe('Banner', () => {
  it('can be dismissed', async () => {
    const onDismiss = vi.fn();
    render(<Banner title="Heads up" onDismiss={onDismiss}>Body</Banner>);
    expect(screen.getByRole('region', { name: 'Heads up' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Body')).toBeNull();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

function TagHarness({ onInvalid }: { onInvalid?: (t: string, m: string) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <TagInput
      aria-label="Emails"
      value={tags}
      onChange={setTags}
      onInvalid={onInvalid}
      validate={(t) => (t.includes('@') ? true : 'Enter a valid email.')}
    />
  );
}

describe('TagInput', () => {
  it('adds on Enter and comma, removes with Backspace', async () => {
    const user = userEvent.setup();
    render(<TagHarness />);
    const input = screen.getByRole('textbox', { name: 'Emails' });
    await user.type(input, 'a@x.io{Enter}b@x.io,');
    expect(screen.getByRole('button', { name: 'Remove a@x.io' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove b@x.io' })).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('button', { name: 'Remove b@x.io' })).toBeNull();
  });
  it('rejects invalid and duplicate tags with a message', async () => {
    const onInvalid = vi.fn();
    const user = userEvent.setup();
    render(<TagHarness onInvalid={onInvalid} />);
    const input = screen.getByRole('textbox', { name: 'Emails' });
    await user.type(input, 'nope{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Enter a valid email.');
    expect(onInvalid).toHaveBeenCalledWith('nope', 'Enter a valid email.');
    await user.type(input, 'a@x.io{Enter}A@X.io{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(/already added/);
  });
});
