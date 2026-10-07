import { toast } from '@nexus/ui';
import { api, isDemoMode } from '../_shared/api';
import type { FileItem } from './types';

/** Only http(s) links are ever navigated to (blocks javascript:/data: URLs from a bad response). */
export function isSafeDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function triggerDownload(href: string, name: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = name;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Ask the backend for a short-lived download URL (`GET /files/:id/download` -> `{ url }`), then
 * start the download. Demo mode stores only metadata, so it downloads a small text stand-in
 * instead of real content.
 */
export async function downloadFile(file: FileItem): Promise<void> {
  try {
    if (isDemoMode) {
      const body = `Demo file: ${file.name}\nType: ${file.mimeType}\nSize: ${file.size} bytes\n\nThe demo API stores metadata only. Connect a backend to download real content.\n`;
      const href = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
      triggerDownload(href, `${file.name}.demo.txt`);
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      return;
    }
    const { url } = await api.get<{ url: string }>(`/files/${encodeURIComponent(file.id)}/download`);
    if (!isSafeDownloadUrl(url)) throw new Error('The server returned an invalid download link.');
    triggerDownload(url, file.name);
  } catch (error) {
    toast.error('Could not download the file', { description: error instanceof Error ? error.message : undefined });
  }
}
