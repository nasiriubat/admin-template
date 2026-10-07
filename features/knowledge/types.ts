export type DocumentStatus = 'queued' | 'indexing' | 'indexed' | 'failed';
export type DocumentType = 'pdf' | 'md' | 'txt' | 'docx';
export type SourceType = 'web' | 'github' | 'gdrive' | 's3' | 'notion';
export type SourceStatus = 'active' | 'paused' | 'syncing' | 'error';
export type SyncSchedule = 'manual' | 'hourly' | 'daily' | 'weekly';

export interface KnowledgeDocument {
  id: string;
  title: string;
  sourceId: string;
  sourceName: string;
  type: DocumentType;
  size: number;
  status: DocumentStatus;
  chunks: number;
  updatedAt: string;
  failureReason: string | null;
  /** Short text excerpts of the first indexed chunks. */
  chunkPreview: string[];
}

/** Connector metadata. Credentials are write-only: the API only reports whether one is stored. */
export interface KnowledgeSource {
  id: string;
  type: SourceType;
  name: string;
  /** Non-secret location: https URL, `owner/repo` or bucket name. */
  location: string;
  schedule: SyncSchedule;
  lastSyncAt: string | null;
  status: SourceStatus;
  documentCount: number;
  hasCredential: boolean;
  errorMessage: string | null;
}

export interface SourceInput {
  type: SourceType;
  name: string;
  location: string;
  schedule: SyncSchedule;
  credential?: string;
}

export interface UploadDocumentInput {
  name: string;
  size: number;
}

export const DOCUMENT_STATUSES: ReadonlyArray<{ value: DocumentStatus; label: string }> = [
  { value: 'queued', label: 'Queued' },
  { value: 'indexing', label: 'Indexing' },
  { value: 'indexed', label: 'Indexed' },
  { value: 'failed', label: 'Failed' },
];

export const SOURCE_TYPES: ReadonlyArray<{ value: SourceType; label: string; icon: string; locationLabel: string; placeholder: string }> = [
  { value: 'web', label: 'Website', icon: 'Globe', locationLabel: 'Site URL', placeholder: 'https://docs.example.com' },
  { value: 'github', label: 'GitHub', icon: 'Github', locationLabel: 'Repository', placeholder: 'owner/repository' },
  { value: 'gdrive', label: 'Google Drive', icon: 'HardDrive', locationLabel: 'Folder URL', placeholder: 'https://drive.google.com/drive/folders/…' },
  { value: 's3', label: 'Amazon S3', icon: 'Database', locationLabel: 'Bucket name', placeholder: 'my-knowledge-bucket' },
  { value: 'notion', label: 'Notion', icon: 'BookOpen', locationLabel: 'Workspace URL', placeholder: 'https://www.notion.so/your-workspace' },
];

export const SCHEDULES: ReadonlyArray<{ value: SyncSchedule; label: string }> = [
  { value: 'manual', label: 'Manual only' },
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export const sourceTypeMeta = (type: SourceType) => SOURCE_TYPES.find((t) => t.value === type) ?? SOURCE_TYPES[0];
