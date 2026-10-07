import { z } from 'zod';
import type { FileKind } from './types';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Extensions accepted by the uploader (also used for the input `accept` attribute). */
export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'json', 'zip', 'gz', 'tar'] as const;
export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
const DOC_EXT = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv']);
const ARCHIVE_EXT = new Set(['zip', 'gz', 'tar']);

export const extensionOf = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > 0 && i < name.length - 1 ? name.slice(i + 1).toLowerCase() : '';
};

export function classifyFile(name: string, mimeType = ''): FileKind {
  const ext = extensionOf(name);
  if (IMAGE_EXT.has(ext) || mimeType.startsWith('image/')) return 'image';
  if (DOC_EXT.has(ext)) return 'document';
  if (ARCHIVE_EXT.has(ext)) return 'archive';
  return 'other';
}

/** Returns a user-facing error message, or null when the file may be uploaded. */
export function validateFile(file: { name: string; size: number }): string | null {
  const ext = extensionOf(file.name);
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return ext ? `.${ext} files are not allowed.` : 'Files without an extension are not allowed.';
  }
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_FILE_SIZE) return 'This file is larger than 10 MB.';
  return null;
}

export const renameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a file name.')
    .max(120, 'Keep the name under 120 characters.')
    .refine((v) => !/[\\/:*?"<>|]/.test(v), 'Names cannot contain \\ / : * ? " < > |')
    .refine((v) => (ALLOWED_EXTENSIONS as readonly string[]).includes(extensionOf(v)), 'Keep a supported file extension, such as .pdf or .png.'),
});
export type RenameInput = z.input<typeof renameSchema>;
export type RenameValues = z.output<typeof renameSchema>;
