import { z } from 'zod';
import type { DocumentType } from './types';

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
/** Plain-text knowledge formats only: no SVG, HTML or scriptable types. */
export const DOCUMENT_EXTENSIONS: readonly DocumentType[] = ['pdf', 'md', 'txt', 'docx'];
export const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.map((e) => `.${e}`).join(',');

export const extensionOf = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > 0 && i < name.length - 1 ? name.slice(i + 1).toLowerCase() : '';
};

/** Returns a user-facing error, or null when the file may be uploaded. */
export function validateDocument(file: { name: string; size: number }): string | null {
  const ext = extensionOf(file.name);
  if (!(DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) {
    return ext ? `.${ext} files are not allowed. Use PDF, Markdown, text or Word.` : 'Files without an extension are not allowed.';
  }
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_DOCUMENT_SIZE) return 'This file is larger than 10 MB.';
  return null;
}

const httpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const sourceFormSchema = z
  .object({
    type: z.enum(['web', 'github', 'gdrive', 's3', 'notion']),
    name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80, 'Keep it under 80 characters.'),
    location: z.string().trim().min(1, 'This field is required.').max(300, 'Keep it under 300 characters.'),
    schedule: z.enum(['manual', 'hourly', 'daily', 'weekly']),
    credential: z.string().max(500, 'Keep it under 500 characters.').optional(),
  })
  .superRefine((value, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', path: ['location'], message });
    if (value.type === 'web' || value.type === 'gdrive' || value.type === 'notion') {
      if (!httpsUrl(value.location)) fail('Enter a valid https:// URL.');
    } else if (value.type === 'github') {
      if (!/^[\w.-]+\/[\w.-]+$/.test(value.location)) fail('Use the owner/repository format.');
    } else if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(value.location)) {
      fail('Enter a valid bucket name (3-63 lowercase letters, numbers, dots or hyphens).');
    }
    if (value.type === 's3' && !value.credential?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['credential'], message: 'An access credential is required for S3.' });
    }
  });

export type SourceFormInput = z.input<typeof sourceFormSchema>;
export type SourceFormValues = z.output<typeof sourceFormSchema>;
