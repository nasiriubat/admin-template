'use client';

import { useState } from 'react';
import {
  Button,
  Checkbox,
  Combobox,
  DatePicker,
  DateRangeInput,
  FormField,
  Input,
  Label,
  MultiSelect,
  SearchInput,
  SegmentedControl,
  Select,
  Switch,
  TagInput,
  Textarea,
  type DateRange,
} from '@nexus/ui';
import { GallerySection, Specimen } from './gallery-section';

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'vite', label: 'Vite' },
  { value: 'nuxt', label: 'Nuxt', disabled: true },
];

export function GalleryButtons() {
  return (
    <GallerySection id="buttons" title="Buttons" description="Variants, sizes and states. Loading buttons are disabled and aria-busy.">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="danger-ghost">Danger ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
      </div>
    </GallerySection>
  );
}

export function GalleryInputs() {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'list' | 'grid'>('list');
  const [on, setOn] = useState(true);
  return (
    <GallerySection id="inputs" title="Inputs and selects" description="Every control in its default, error, disabled and read-only state.">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Default" hint="Helper text sits under the control."><Input placeholder="Type here" /></FormField>
        <FormField label="With error" error="This value is not valid." required><Input defaultValue="oops" /></FormField>
        <FormField label="Disabled"><Input defaultValue="Can’t edit" disabled /></FormField>
        <FormField label="Read-only"><Input defaultValue="Read only value" readOnly /></FormField>
        <FormField label="Native select"><Select defaultValue="b"><option value="a">Option A</option><option value="b">Option B</option></Select></FormField>
        <FormField label="Select with error" error="Choose an option."><Select defaultValue=""><option value="">Choose…</option><option value="a">Option A</option></Select></FormField>
        <FormField label="Textarea" optional><Textarea placeholder="Longer text" /></FormField>
        <FormField label="Search"><SearchInput value={search} onValueChange={setSearch} placeholder="Search the gallery" /></FormField>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-2"><Switch id="g-sw" checked={on} onCheckedChange={setOn} /><Label htmlFor="g-sw">Switch {on ? 'on' : 'off'}</Label></div>
        <div className="flex items-center gap-2"><Switch id="g-sw-d" disabled /><Label htmlFor="g-sw-d">Disabled switch</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="g-cb" defaultChecked /><Label htmlFor="g-cb">Checkbox</Label></div>
        <SegmentedControl label="View mode" value={mode} onChange={setMode} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} />
      </div>
    </GallerySection>
  );
}

export function GalleryPickers() {
  const [one, setOne] = useState<string | null>('next');
  const [many, setMany] = useState<string[]>(['next', 'vite']);
  const [tags, setTags] = useState<string[]>(['design', 'infra']);
  const [range, setRange] = useState<DateRange>({ from: '2026-05-10', to: '2026-05-01' });
  return (
    <GallerySection id="pickers" title="Combobox, tags and dates" description="Searchable selection, typed tags and native date inputs with validation.">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Combobox (single)">
          {(a) => <Combobox {...a} options={FRAMEWORKS} value={one} onChange={setOne} placeholder="Pick a framework" />}
        </FormField>
        <FormField label="MultiSelect">
          {(a) => <MultiSelect {...a} options={FRAMEWORKS} value={many} onChange={setMany} placeholder="Pick frameworks" />}
        </FormField>
        <FormField label="Tag input" hint="Enter or comma adds, Backspace removes.">
          {(a) => <TagInput {...a} value={tags} onChange={setTags} maxTags={6} validate={(t) => (t.length <= 12 ? true : 'Keep tags under 13 characters.')} />}
        </FormField>
        <FormField label="Date (min and max)" hint="Only 2026 is allowed.">
          <DatePicker min="2026-01-01" max="2026-12-31" defaultValue="2026-06-15" />
        </FormField>
      </div>
      <Specimen label="Date range with validation (from is after to)">
        <DateRangeInput value={range} onChange={setRange} />
      </Specimen>
    </GallerySection>
  );
}
