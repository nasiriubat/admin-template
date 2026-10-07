import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, FIRST_NAMES, LAST_NAMES, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { PROJECT_STATUSES, type Project } from './projects';

const rng = createRng(777);
const NAMES = ['Atlas migration', 'Billing revamp', 'Customer portal', 'Data lake', 'Edge cache', 'Mobile app', 'Onboarding flow', 'Search relevance', 'Status page', 'Zero-downtime deploys', 'Partner API', 'Audit export'];
const TAGS = ['infra', 'frontend', 'backend', 'design', 'research', 'compliance'];

const seed: Project[] = NAMES.map((name, i) => ({
  id: `p-${String(i + 1).padStart(3, '0')}`,
  name,
  owner: `${FIRST_NAMES[(i * 5) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
  status: PROJECT_STATUSES[i % PROJECT_STATUSES.length].value,
  budget: rng.int(4, 120) * 1000,
  tags: [TAGS[i % TAGS.length], TAGS[(i + 2) % TAGS.length]],
  createdAt: daysAgo(rng.int(5, 300)),
}));

export const projectsCollection = createCollection<Project>(seed, {
  searchFields: ['name', 'owner'],
  filterFields: ['status'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
});

mockRouter.on('GET', '/examples/projects', ({ query }) => projectsCollection.list(query));
mockRouter.on('GET', '/examples/projects/:id/activity', ({ params }) => [
  { id: 'a1', title: 'Budget approved', description: 'Finance signed off the Q3 budget.', at: minutesAgo(45), icon: 'CheckCircle2', tone: 'success', projectId: params.id },
  { id: 'a2', title: 'Status changed to Active', description: 'Moved from Planned by the project owner.', at: minutesAgo(60 * 20), icon: 'Play', tone: 'primary', projectId: params.id },
  { id: 'a3', title: 'Scope comment added', description: 'Two open questions about rollout order.', at: minutesAgo(60 * 52), icon: 'FileText', tone: 'info', projectId: params.id },
  { id: 'a4', title: 'Project created', at: minutesAgo(60 * 24 * 14), icon: 'Plus', tone: 'neutral', projectId: params.id },
]);
mockRouter.on('GET', '/examples/projects/:id', ({ params }) => projectsCollection.get(params.id));
mockRouter.on('POST', '/examples/projects', ({ body }) => {
  const input = body as Pick<Project, 'name' | 'owner' | 'status' | 'budget' | 'tags'>;
  if (projectsCollection.all().some((p) => p.name.toLowerCase() === input.name.toLowerCase())) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: 'A project with this name already exists.' });
  }
  return projectsCollection.create({ ...input, createdAt: new Date().toISOString() });
});
mockRouter.on('PATCH', '/examples/projects/:id', ({ params, body }) => projectsCollection.update(params.id, body as Partial<Project>));
mockRouter.on('DELETE', '/examples/projects/:id', ({ params }) => projectsCollection.remove(params.id));

/** Wizard submission: accepts the payload and returns a reference number. */
mockRouter.on('POST', '/examples/onboarding', ({ body }) => {
  const input = body as { workspaceName?: string };
  if (input.workspaceName?.toLowerCase() === 'taken') {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { workspaceName: 'That workspace name is taken.' });
  }
  return { reference: `ONB-${rng.int(1000, 9999)}` };
});
