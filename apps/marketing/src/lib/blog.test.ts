import { describe, expect, it } from 'vitest';
import { countWords, readingTime, sortByDateDesc, uniqueTags } from './blog';
import { jsonLd } from './seo';
import { posts } from '../content/posts';
import { docPages } from '../content/docs';

describe('blog helpers', () => {
  it('counts words and ignores code samples', () => {
    expect(countWords([{ type: 'p', text: 'one two three' }, { type: 'ul', items: ['four five'] }, { type: 'code', code: 'ignored words here' }])).toBe(5);
  });
  it('reading time is at least one minute and rounds up', () => {
    expect(readingTime([{ type: 'p', text: 'short' }])).toBe(1);
    expect(readingTime([{ type: 'p', text: Array(221).fill('word').join(' ') }])).toBe(2);
  });
  it('sorts newest first without mutating and collects unique sorted tags', () => {
    const input = [{ date: '2026-01-01', tags: ['b'] }, { date: '2026-03-01', tags: ['a', 'b'] }];
    expect(sortByDateDesc(input)[0].date).toBe('2026-03-01');
    expect(input[0].date).toBe('2026-01-01');
    expect(uniqueTags(input)).toEqual(['a', 'b']);
  });
  it('escapes angle brackets in JSON-LD', () => {
    expect(jsonLd({ a: '</script>' })).not.toContain('<');
  });
  it('content has unique slugs', () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
    expect(new Set(docPages.map((d) => d.slug)).size).toBe(docPages.length);
  });
});
