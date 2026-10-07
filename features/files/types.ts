export type FileKind = 'image' | 'document' | 'archive' | 'other';

export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: FileKind;
  uploadedBy: string;
  createdAt: string;
  /** Shareable link. A real backend returns a signed or public URL. */
  url: string;
}

export const FILE_KINDS: ReadonlyArray<{ value: FileKind; label: string; icon: string }> = [
  { value: 'image', label: 'Images', icon: 'Image' },
  { value: 'document', label: 'Documents', icon: 'FileText' },
  { value: 'archive', label: 'Archives', icon: 'Folder' },
  { value: 'other', label: 'Other', icon: 'File' },
];

export const kindIcon = (kind: FileKind) => FILE_KINDS.find((k) => k.value === kind)?.icon ?? 'File';
export const kindLabel = (kind: FileKind) => FILE_KINDS.find((k) => k.value === kind)?.label ?? 'Other';

export type FileSort = 'createdAt' | 'name' | 'size';

export const FILE_SORTS: ReadonlyArray<{ value: string; label: string; sort: FileSort; direction: 'asc' | 'desc' }> = [
  { value: 'createdAt:desc', label: 'Newest first', sort: 'createdAt', direction: 'desc' },
  { value: 'createdAt:asc', label: 'Oldest first', sort: 'createdAt', direction: 'asc' },
  { value: 'name:asc', label: 'Name A to Z', sort: 'name', direction: 'asc' },
  { value: 'name:desc', label: 'Name Z to A', sort: 'name', direction: 'desc' },
  { value: 'size:desc', label: 'Largest first', sort: 'size', direction: 'desc' },
  { value: 'size:asc', label: 'Smallest first', sort: 'size', direction: 'asc' },
];

export interface UploadInput {
  name: string;
  size: number;
  mimeType: string;
}
