import { describe, expect, it } from 'vitest';
import { parseStat } from './stat-utils';

describe('parseStat', () => {
  it('splits numbers from their prefix and suffix', () => {
    expect(parseStat('14')).toEqual({ prefix: '', value: 14, suffix: '', decimals: 0 });
    expect(parseStat('99.9%')).toEqual({ prefix: '', value: 99.9, suffix: '%', decimals: 1 });
    expect(parseStat('$1,200')).toEqual({ prefix: '$', value: 1200, suffix: '', decimals: 0 });
  });
  it('leaves text-led values static', () => {
    expect(parseStat('AA')).toBeNull();
    expect(parseStat('SOC 2')).toBeNull();
  });
});
