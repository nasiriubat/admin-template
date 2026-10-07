import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScheduleEditor } from './schedule-editor';
import { DEFAULT_SCHEDULE } from './types';

describe('ScheduleEditor', () => {
  it('describes the schedule and previews the next five runs', () => {
    render(<ScheduleEditor value={DEFAULT_SCHEDULE} onChange={() => undefined} readOnly={false} />);
    expect(screen.getByText('Every weekday at 09:00')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Schedule preview' }).querySelectorAll('li')).toHaveLength(5);
  });

  it('rebuilds the cron when a preset changes and reports it', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ScheduleEditor value={DEFAULT_SCHEDULE} onChange={onChange} readOnly={false} />);
    await user.selectOptions(screen.getByLabelText('Repeat'), 'hourly');
    expect(screen.getByLabelText(/Cron expression/)).toHaveValue('0 * * * *');
    expect(screen.getByText('Every hour, on the hour')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ cron: '0 * * * *' }));
  });

  it('shows an inline error for an invalid custom cron', async () => {
    const user = userEvent.setup();
    render(<ScheduleEditor value={DEFAULT_SCHEDULE} onChange={() => undefined} readOnly={false} />);
    await user.selectOptions(screen.getByLabelText('Repeat'), 'custom');
    fireEvent.change(screen.getByLabelText(/Cron expression/), { target: { value: '61 * * * *' } });
    expect(await screen.findByText(/out of range/)).toBeInTheDocument();
    expect(screen.getByText('Fix the cron expression to see upcoming runs.')).toBeInTheDocument();
  });

  it('is not editable in read-only mode', () => {
    render(<ScheduleEditor value={DEFAULT_SCHEDULE} onChange={() => undefined} readOnly />);
    expect(screen.getByLabelText('Repeat')).toBeDisabled();
  });
});
