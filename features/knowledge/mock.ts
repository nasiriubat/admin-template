import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { extensionOf, validateDocument } from './schemas';
import type { DocumentType, KnowledgeDocument, KnowledgeSource, SourceInput, UploadDocumentInput } from './types';

const rng = createRng(20260707);

const sourceSeed: KnowledgeSource[] = [
  { id: 'src-001', type: 'web', name: 'Product documentation', location: 'https://docs.example.com', schedule: 'daily', lastSyncAt: minutesAgo(95), status: 'active', documentCount: 0, hasCredential: false, errorMessage: null },
  { id: 'src-002', type: 'github', name: 'Engineering handbook', location: 'example-org/handbook', schedule: 'hourly', lastSyncAt: minutesAgo(22), status: 'active', documentCount: 0, hasCredential: true, errorMessage: null },
  { id: 'src-003', type: 'gdrive', name: 'Support playbooks', location: 'https://drive.google.com/drive/folders/support-playbooks', schedule: 'weekly', lastSyncAt: daysAgo(3), status: 'paused', documentCount: 0, hasCredential: true, errorMessage: null },
  { id: 'src-004', type: 's3', name: 'Legal archive', location: 'example-legal-archive', schedule: 'manual', lastSyncAt: daysAgo(12), status: 'error', documentCount: 0, hasCredential: true, errorMessage: 'Access denied: the stored credential can no longer read this bucket.' },
  { id: 'src-005', type: 'notion', name: 'Company wiki', location: 'https://www.notion.so/example-wiki', schedule: 'daily', lastSyncAt: minutesAgo(310), status: 'active', documentCount: 0, hasCredential: true, errorMessage: null },
];

const TOPICS = ['Getting started', 'Refund policy', 'Data retention', 'Single sign-on setup', 'Incident response', 'API rate limits', 'Billing FAQ', 'Onboarding checklist', 'Security overview', 'Release notes', 'Escalation matrix', 'Webhook reference', 'Brand voice guide', 'Pricing rules', 'Support macros', 'Roadmap summary'];
const TYPES: DocumentType[] = ['pdf', 'md', 'txt', 'docx', 'md', 'pdf'];
const EXCERPTS = [
  'Customers can request a full refund within 30 days of purchase by contacting support.',
  'Access tokens expire after one hour and must be refreshed with the stored refresh token.',
  'Audit logs are retained for 400 days and can be exported by administrators at any time.',
  'Escalate to the on-call engineer when the incident affects more than five percent of requests.',
  'Each workspace includes a default rate limit of 600 requests per minute per key.',
];
const FAILURES = ['The file is password protected and could not be read.', 'No extractable text was found in this document.', 'Parsing timed out after 120 seconds.'];

const docSeed: KnowledgeDocument[] = Array.from({ length: 36 }, (_, i) => {
  const source = sourceSeed[i % sourceSeed.length];
  const type = TYPES[i % TYPES.length];
  const status = i % 9 === 4 ? 'failed' : i % 8 === 1 ? 'queued' : i % 10 === 6 ? 'indexing' : 'indexed';
  const chunks = status === 'indexed' ? rng.int(4, 60) : 0;
  return {
    id: `kd-${String(i + 1).padStart(3, '0')}`,
    title: `${TOPICS[i % TOPICS.length]}${i >= TOPICS.length ? ` (${Math.floor(i / TOPICS.length) + 1})` : ''}`,
    sourceId: source.id,
    sourceName: source.name,
    type,
    size: rng.int(8_000, 6_500_000),
    status,
    chunks,
    updatedAt: minutesAgo(rng.int(5, 60 * 24 * 40)),
    failureReason: status === 'failed' ? FAILURES[i % FAILURES.length] : null,
    chunkPreview: status === 'indexed' ? [EXCERPTS[i % 5], EXCERPTS[(i + 2) % 5], EXCERPTS[(i + 3) % 5]] : [],
  };
});
for (const s of sourceSeed) s.documentCount = docSeed.filter((d) => d.sourceId === s.id).length;

export const documentsCollection = createCollection<KnowledgeDocument>(docSeed, {
  searchFields: ['title', 'sourceName'],
  filterFields: ['status', 'sourceId', 'type'],
  defaultSort: { field: 'updatedAt', direction: 'desc' },
});
export const sourcesCollection = createCollection<KnowledgeSource>(sourceSeed, {
  searchFields: ['name', 'location'],
  filterFields: ['type', 'status'],
  defaultSort: { field: 'name', direction: 'asc' },
});

const recount = () => {
  for (const s of sourcesCollection.all()) sourcesCollection.update(s.id, { documentCount: documentsCollection.all().filter((d) => d.sourceId === s.id).length });
};

mockRouter.on('GET', '/knowledge/documents', ({ query }) => documentsCollection.list(query));
mockRouter.on('POST', '/knowledge/documents', ({ body }) => {
  const input = body as UploadDocumentInput;
  const error = validateDocument(input);
  if (error) throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: error });
  const doc = documentsCollection.create({
    title: input.name.replace(/\.[^.]+$/, ''),
    sourceId: 'src-upload',
    sourceName: 'Manual upload',
    type: extensionOf(input.name) as DocumentType,
    size: input.size,
    status: 'queued',
    chunks: 0,
    updatedAt: new Date().toISOString(),
    failureReason: null,
    chunkPreview: [],
  });
  return doc;
});
mockRouter.on('POST', '/knowledge/documents/reindex', ({ body }) => {
  const { ids } = body as { ids: string[] };
  for (const id of ids) documentsCollection.update(id, { status: 'queued', failureReason: null, updatedAt: new Date().toISOString() });
  return { affected: ids.length };
});
mockRouter.on('DELETE', '/knowledge/documents/:id', ({ params }) => {
  const res = documentsCollection.remove(params.id);
  recount();
  return res;
});

mockRouter.on('GET', '/knowledge/sources', ({ query }) => sourcesCollection.list(query));
mockRouter.on('POST', '/knowledge/sources', ({ body }) => {
  const { credential, ...input } = body as SourceInput;
  // The credential is accepted once and never stored or echoed back: only a flag is kept.
  return sourcesCollection.create({ ...input, lastSyncAt: null, status: 'active', documentCount: 0, hasCredential: Boolean(credential), errorMessage: null });
});
mockRouter.on('PATCH', '/knowledge/sources/:id', ({ params, body }) => {
  const { paused } = body as { paused: boolean };
  return sourcesCollection.update(params.id, { status: paused ? 'paused' : 'active' });
});
mockRouter.on('POST', '/knowledge/sources/:id/sync', ({ params }) => sourcesCollection.update(params.id, { lastSyncAt: new Date().toISOString(), status: 'active', errorMessage: null }));
mockRouter.on('DELETE', '/knowledge/sources/:id', ({ params }) => sourcesCollection.remove(params.id));
