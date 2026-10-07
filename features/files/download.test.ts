import { describe, expect, it } from 'vitest';
import { isSafeDownloadUrl } from './download';

describe('isSafeDownloadUrl', () => {
  it.each([
    ['https://files.example.com/a.pdf', true],
    ['http://localhost:9000/a.pdf', true],
    ['javascript:alert(1)', false],
    ['data:text/html,<script>alert(1)</script>', false],
    ['file:///etc/passwd', false],
    ['not a url', false],
  ])('%s -> %s', (url, expected) => expect(isSafeDownloadUrl(url)).toBe(expected));
});
