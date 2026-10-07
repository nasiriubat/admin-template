import { describe, expect, it } from 'vitest';
import { doneCount } from './phone-mock';

describe('doneCount', () => {
  it('ticks habits off one per step and caps at the total', () => {
    expect(doneCount(0, 3)).toBe(0);
    expect(doneCount(2, 3)).toBe(2);
    expect(doneCount(4, 3)).toBe(3);
  });
});
