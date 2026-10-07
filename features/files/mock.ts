import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, FIRST_NAMES, LAST_NAMES, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { classifyFile } from './schemas';
import type { FileItem, UploadInput } from './types';

const rng = createRng(20260303);

const NAMES: Array<[string, string, number]> = [
  ['Q3-board-report.pdf', 'application/pdf', 2_480_000],
  ['brand-guidelines-v4.pdf', 'application/pdf', 7_900_000],
  ['onboarding-checklist.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 184_000],
  ['pricing-model.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 612_000],
  ['customer-export-2026-09.csv', 'text/csv', 1_340_000],
  ['release-notes.md', 'text/markdown', 9_800],
  ['hero-banner.png', 'image/png', 1_120_000],
  ['team-offsite.jpg', 'image/jpeg', 3_640_000],
  ['logo-mark.svg', 'image/svg+xml', 4_200],
  ['dashboard-screenshot.webp', 'image/webp', 420_000],
  ['product-tour.gif', 'image/gif', 5_200_000],
  ['avatar-set.zip', 'application/zip', 8_450_000],
  ['db-backup-sept.tar', 'application/x-tar', 9_700_000],
  ['invoices-2025.zip', 'application/zip', 4_100_000],
  ['security-whitepaper.pdf', 'application/pdf', 1_850_000],
  ['roadmap-2027.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5_600_000],
  ['api-schema.json', 'application/json', 64_000],
  ['support-macros.txt', 'text/plain', 12_400],
  ['campaign-banner.jpg', 'image/jpeg', 2_210_000],
  ['data-processing-agreement.pdf', 'application/pdf', 390_000],
  ['icons-sprite.svg', 'image/svg+xml', 38_000],
  ['quarterly-metrics.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 940_000],
  ['legacy-assets.gz', 'application/gzip', 6_300_000],
  ['press-kit.zip', 'application/zip', 9_100_000],
];

const slug = (s: string) => encodeURIComponent(s);
const seed: FileItem[] = NAMES.map(([name, mimeType, size], i) => ({
  id: `f-${String(i + 1).padStart(3, '0')}`,
  name,
  mimeType,
  size,
  kind: classifyFile(name, mimeType),
  uploadedBy: `${FIRST_NAMES[(i * 5) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length]}`,
  createdAt: i < 3 ? minutesAgo(rng.int(20, 600)) : daysAgo(rng.int(1, 200)),
  url: `https://files.example.com/workspace/${slug(name)}`,
}));

export const filesCollection = createCollection<FileItem>(seed, {
  searchFields: ['name', 'uploadedBy'],
  filterFields: ['kind'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
});

function assertNameFree(name: string, exceptId?: string) {
  const clash = filesCollection.all().some((f) => f.name.toLowerCase() === name.toLowerCase() && f.id !== exceptId);
  if (clash) throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: 'A file with this name already exists.' });
}

mockRouter.on('GET', '/files', ({ query }) => filesCollection.list(query));
mockRouter.on('POST', '/files', ({ body }) => {
  const input = body as UploadInput;
  assertNameFree(input.name);
  return filesCollection.create({
    name: input.name,
    mimeType: input.mimeType,
    size: input.size,
    kind: classifyFile(input.name, input.mimeType),
    uploadedBy: 'You',
    createdAt: new Date().toISOString(),
    url: `https://files.example.com/workspace/${slug(input.name)}`,
  });
});
mockRouter.on('PATCH', '/files/:id', ({ params, body }) => {
  const { name } = body as { name: string };
  assertNameFree(name, params.id);
  return filesCollection.update(params.id, { name, kind: classifyFile(name), url: `https://files.example.com/workspace/${slug(name)}` });
});
mockRouter.on('DELETE', '/files/:id', ({ params }) => filesCollection.remove(params.id));
