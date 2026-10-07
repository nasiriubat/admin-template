import { describe, expect, it } from 'vitest';
import { ALLOWED_EXTENSIONS } from './schemas';

describe('upload allow-list', () => {
  it('does not accept SVG (scriptable image format) or active content', () => {
    for (const ext of ['svg', 'html', 'htm', 'js', 'exe', 'sh']) {
      expect(ALLOWED_EXTENSIONS as readonly string[]).not.toContain(ext);
    }
  });
});
