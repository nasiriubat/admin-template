import { describe, expect, it } from 'vitest';
import { escapeCsvCell, toCsv } from './csv';

describe('CSV export', () => {
  it('quotes cells containing commas, quotes and newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });
  it('neutralises spreadsheet formula injection', () => {
    for (const evil of ['=HYPERLINK("http://evil")', '+1+1', '-2+3', '@SUM(A1)']) {
      expect(escapeCsvCell(evil).replace(/^"/, '').startsWith("'")).toBe(true);
    }
  });
  it('handles null, numbers and dates', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(0)).toBe('0');
    expect(escapeCsvCell(new Date('2026-01-02T03:04:05Z'))).toBe('2026-01-02T03:04:05.000Z');
  });
  it('joins rows with CRLF', () => {
    expect(toCsv(['a', 'b'], [[1, 'x']])).toBe('a,b\r\n1,x');
  });
});
