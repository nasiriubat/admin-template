import { describe, expect, it } from 'vitest';
import { ring, solid, toneOf } from './tones';

describe('playful tones', () => {
  it('pairs every solid fill with a foreground token', () => {
    for (const cls of Object.values(solid)) expect(cls).toMatch(/^bg-(\w+) text-\1-foreground$/);
  });
  it('has a ring for every tone', () => {
    expect(Object.keys(ring).sort()).toEqual(Object.keys(solid).sort());
  });
  it('falls back to primary for unknown tones', () => {
    expect(toneOf('warning')).toBe('warning');
    expect(toneOf('nope')).toBe('primary');
  });
});
