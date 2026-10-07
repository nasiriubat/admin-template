import { describe, expect, it } from 'vitest';
import { classifyFile, MAX_FILE_SIZE, renameSchema, validateFile } from './schemas';

describe('classifyFile', () => {
  it('maps extensions to kinds', () => {
    expect(classifyFile('logo.PNG')).toBe('image');
    expect(classifyFile('report.pdf')).toBe('document');
    expect(classifyFile('backup.zip')).toBe('archive');
    expect(classifyFile('README')).toBe('other');
  });
  it('falls back to the mime type for images', () => {
    expect(classifyFile('photo', 'image/heic')).toBe('image');
  });
});

describe('validateFile', () => {
  it('accepts allowed files within the size limit', () => {
    expect(validateFile({ name: 'a.pdf', size: 1024 })).toBeNull();
    expect(validateFile({ name: 'a.pdf', size: MAX_FILE_SIZE })).toBeNull();
  });
  it('rejects oversized, empty and disallowed files', () => {
    expect(validateFile({ name: 'a.pdf', size: MAX_FILE_SIZE + 1 })).toMatch(/10 MB/);
    expect(validateFile({ name: 'a.pdf', size: 0 })).toMatch(/empty/);
    expect(validateFile({ name: 'run.exe', size: 10 })).toMatch(/not allowed/);
    expect(validateFile({ name: 'noext', size: 10 })).toMatch(/extension/);
  });
});

describe('renameSchema', () => {
  it('trims and accepts a valid name', () => {
    expect(renameSchema.parse({ name: '  plan.pdf ' }).name).toBe('plan.pdf');
  });
  it('rejects blank names, illegal characters and unsupported extensions', () => {
    expect(renameSchema.safeParse({ name: '  ' }).success).toBe(false);
    expect(renameSchema.safeParse({ name: 'a/b.pdf' }).success).toBe(false);
    expect(renameSchema.safeParse({ name: 'virus.exe' }).success).toBe(false);
  });
});
