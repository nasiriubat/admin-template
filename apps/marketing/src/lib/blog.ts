import type { ContentBlock } from '@nexus/ui';

export const WORDS_PER_MINUTE = 220;

function blockText(b: ContentBlock): string {
  switch (b.type) {
    case 'ul':
    case 'ol':
      return b.items.join(' ');
    case 'code':
      return '';
    default:
      return b.text;
  }
}

export function countWords(blocks: ContentBlock[]): number {
  return blocks
    .map(blockText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Reading time in whole minutes (minimum 1). Code samples are excluded. */
export function readingTime(blocks: ContentBlock[], wpm = WORDS_PER_MINUTE): number {
  return Math.max(1, Math.ceil(countWords(blocks) / wpm));
}

export function uniqueTags(posts: Array<{ tags: string[] }>): string[] {
  return [...new Set(posts.flatMap((p) => p.tags))].sort();
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
