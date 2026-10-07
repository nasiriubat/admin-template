import { Button, cn, Select } from '@nexus/ui';
import { LOG_LEVELS, LOG_SERVICES, TIME_RANGES, type LogLevel } from './types';

export interface LogFilterState {
  levels: LogLevel[];
  service: string;
  range: string;
}

interface Props {
  value: LogFilterState;
  onChange: (next: LogFilterState) => void;
}

/** Controls rendered inside the shared FilterBar (inline on desktop, sheet on mobile). */
export function LogFilterControls({ value, onChange }: Props) {
  const toggle = (level: LogLevel) =>
    onChange({ ...value, levels: value.levels.includes(level) ? value.levels.filter((l) => l !== level) : [...value.levels, level] });

  return (
    <>
      <fieldset className="min-w-0">
        <legend className="sr-only">Filter by level</legend>
        <div className="flex flex-wrap gap-1.5">
          {LOG_LEVELS.map((l) => {
            const pressed = value.levels.includes(l.value);
            return (
              <Button
                key={l.value}
                size="sm"
                variant={pressed ? 'primary' : 'secondary'}
                aria-pressed={pressed}
                onClick={() => toggle(l.value)}
                className={cn('min-w-14')}
              >
                {l.label}
              </Button>
            );
          })}
        </div>
      </fieldset>
      <Select aria-label="Filter by service" value={value.service} onChange={(e) => onChange({ ...value, service: e.target.value })} className="md:w-40">
        <option value="">All services</option>
        {LOG_SERVICES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select aria-label="Time range" value={value.range} onChange={(e) => onChange({ ...value, range: e.target.value })} className="md:w-44">
        <option value="">All time</option>
        {TIME_RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>
    </>
  );
}

export const countActiveFilters = (f: LogFilterState) => Number(f.levels.length > 0) + Number(Boolean(f.service)) + Number(Boolean(f.range));
