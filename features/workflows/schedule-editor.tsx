'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormField, Input, Label, Select, Switch, useZodForm } from '@nexus/ui';
import { buildPreset, describeCron, detectPreset, getTimeZones, nextRuns, PRESET_LABELS, validateCron, WEEKDAY_NAMES, type PresetKind, type PresetOptions } from './cron';
import { scheduleSchema } from './schemas';
import type { ScheduleConfig } from './types';

const PREVIEW_COUNT = 5;

/** Preset or custom cron, time zone, concurrency, retry policy, pause and catch-up. Calls onChange on every edit (valid or not). */
export function ScheduleEditor({ value, onChange, readOnly }: { value: ScheduleConfig; onChange: (value: ScheduleConfig) => void; readOnly: boolean }) {
  const initial = useMemo(() => detectPreset(value.cron), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [kind, setKind] = useState<PresetKind>(initial.kind);
  const [opts, setOpts] = useState<PresetOptions>(initial.options);
  const form = useZodForm(scheduleSchema, { defaultValues: value, mode: 'onChange' });
  const { register, setValue, formState: { errors } } = form;
  const values = form.watch() as ScheduleConfig;
  const zones = useMemo(() => { const all = getTimeZones(); return all.includes(values.timezone) ? all : [values.timezone, ...all]; }, [values.timezone]);

  useEffect(() => {
    const sub = form.watch((v) => onChange({ ...(v as ScheduleConfig) }));
    return () => sub.unsubscribe();
  }, [form, onChange]);

  const cronError = validateCron(values.cron ?? '');
  const upcoming = useMemo(() => (cronError ? [] : nextRuns(values.cron, values.timezone, PREVIEW_COUNT)), [cronError, values.cron, values.timezone]);
  const fmt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: values.timezone });
    } catch {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }
  }, [values.timezone]);

  function preset(nextKind: PresetKind, nextOpts: PresetOptions = opts) {
    setKind(nextKind);
    setOpts(nextOpts);
    if (nextKind !== 'custom') setValue('cron', buildPreset(nextKind, nextOpts), { shouldValidate: true, shouldDirty: true });
  }

  const needsTime = kind === 'daily' || kind === 'weekdays' || kind === 'weekly' || kind === 'monthly';
  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} aria-label="Schedule" className="space-y-5">
      <fieldset disabled={readOnly} className="grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2">
        <FormField label="Repeat" className="sm:col-span-2">
          <Select value={kind} onChange={(e) => preset(e.target.value as PresetKind)}>
            {PRESET_LABELS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </FormField>
        {needsTime && (
          <FormField label="Time">
            <Input type="time" value={opts.time} onChange={(e) => e.target.value && preset(kind, { ...opts, time: e.target.value })} />
          </FormField>
        )}
        {kind === 'weekly' && (
          <FormField label="Day of the week">
            <Select value={opts.weekday} onChange={(e) => preset(kind, { ...opts, weekday: Number(e.target.value) })}>
              {WEEKDAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </Select>
          </FormField>
        )}
        {kind === 'monthly' && (
          <FormField label="Day of the month" hint="Months without this day are skipped.">
            <Input type="number" min={1} max={31} value={opts.dayOfMonth} onChange={(e) => preset(kind, { ...opts, dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} />
          </FormField>
        )}
        <FormField label="Cron expression" required error={errors.cron?.message} hint="Five fields: minute hour day-of-month month day-of-week. Supports * , - / and names like MON or JAN." className="sm:col-span-2">
          <Input className="font-mono" autoComplete="off" spellCheck={false} readOnly={kind !== 'custom'} {...register('cron')} />
        </FormField>
        <FormField label="Time zone" error={errors.timezone?.message} className="sm:col-span-2">
          <Select {...register('timezone')}>{zones.map((z) => <option key={z} value={z}>{z}</option>)}</Select>
        </FormField>
      </fieldset>

      <section aria-label="Schedule preview" className="space-y-1.5 rounded-input border border-border bg-canvas p-3">
        <p className="text-sm font-medium text-text" aria-live="polite">{cronError ? 'Fix the cron expression to see upcoming runs.' : describeCron(values.cron)}</p>
        {upcoming.length > 0 && (
          <>
            <p className="text-xs text-text-muted">Next {upcoming.length} runs ({values.timezone})</p>
            <ol className="space-y-0.5 text-sm tabular-nums text-text">
              {upcoming.map((d) => <li key={d.toISOString()}><time dateTime={d.toISOString()}>{fmt.format(d)}</time></li>)}
            </ol>
          </>
        )}
        {!cronError && upcoming.length === 0 && <p className="text-sm text-warning">This expression never fires (for example, February 31).</p>}
      </section>

      <fieldset disabled={readOnly} className="grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2">
        <FormField label="If a run is still going" hint="What happens when the next scheduled time arrives.">
          <Select {...register('concurrency')}>
            <option value="skip">Skip the new run</option>
            <option value="queue">Queue it until the current run finishes</option>
            <option value="allow">Allow runs to overlap</option>
          </Select>
        </FormField>
        <FormField label="Retry attempts" error={errors.retryAttempts?.message} hint="0 to 10 retries after a failure.">
          <Input type="number" min={0} max={10} {...register('retryAttempts', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Retry backoff">
          <Select {...register('backoff')}>
            <option value="none">Retry immediately</option>
            <option value="linear">Linear (30 s, 60 s, 90 s…)</option>
            <option value="exponential">Exponential (30 s, 60 s, 120 s…)</option>
          </Select>
        </FormField>
        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center gap-3">
            <Switch id="schedule-paused" checked={values.paused} onCheckedChange={(v) => setValue('paused', v, { shouldDirty: true })} />
            <Label htmlFor="schedule-paused">Pause schedule<span className="block text-xs font-normal text-text-muted">Keeps the workflow active but stops scheduled runs.</span></Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="schedule-catchup" checked={values.catchUp} onCheckedChange={(v) => setValue('catchUp', v, { shouldDirty: true })} />
            <Label htmlFor="schedule-catchup">Catch up missed runs<span className="block text-xs font-normal text-text-muted">After downtime, run once for the most recent missed time.</span></Label>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
