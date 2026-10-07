/**
 * COPY-ME TEMPLATE, part 1 of 2: everything a resource needs except the page.
 *
 * To add a new resource ("Invoices", "Campaigns", ...):
 *   1. Copy projects.ts + projects-crud-page.tsx and rename Project -> YourThing.
 *   2. Replace the fields in `projectFormSchema` and the `Project` type.
 *   3. Add mock routes (mock.ts) or point `api` at your real endpoints (docs/API_CONTRACT.md).
 *   4. Create a module.ts (see features/users/module.ts) and register it in features/index.ts.
 * In a real feature, split this file into types.ts / schemas.ts / service.ts / hooks.ts like
 * features/users does. It is one file here only to keep the template compact.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';

/* ------------------------------------------------------------------ types */
export const PROJECT_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]['value'];

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  budget: number;
  tags: string[];
  createdAt: string;
}

/* ----------------------------------------------------------------- schema */
/** One Zod schema validates the form on the client; the server must validate again. */
export const projectFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(60, 'Keep it under 60 characters.'),
  owner: z.string().trim().min(2, 'Enter the owner’s name.'),
  status: z.enum(['planned', 'active', 'paused', 'done'], { message: 'Choose a status.' }),
  budget: z.coerce.number({ message: 'Enter a number.' }).min(0, 'Budget cannot be negative.'),
  tags: z.array(z.string()).max(5, 'Use at most 5 tags.'),
});
export type ProjectFormInput = z.input<typeof projectFormSchema>;
export type ProjectFormValues = z.output<typeof projectFormSchema>;

/* ---------------------------------------------------------------- service */
/** The only place that knows the URLs. Components never call `api` directly. */
export const projectsService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<Project>('/examples/projects', query, { signal }),
  get: (id: string, signal?: AbortSignal) => api.get<Project>(`/examples/projects/${encodeURIComponent(id)}`, { signal }),
  create: (input: ProjectFormValues) => api.post<Project>('/examples/projects', input),
  update: (id: string, input: Partial<ProjectFormValues>) => api.patch<Project>(`/examples/projects/${encodeURIComponent(id)}`, input),
  remove: (id: string) => api.delete(`/examples/projects/${encodeURIComponent(id)}`),
};

/* ------------------------------------------------------------------ hooks */
/** Hierarchical keys: invalidating `all` refreshes every list and detail query at once. */
export const projectKeys = {
  all: ['examples', 'projects'] as const,
  list: (query: ListQuery) => ['examples', 'projects', 'list', query] as const,
  detail: (id: string) => ['examples', 'projects', 'detail', id] as const,
};

export function useProjects(query: ListQuery) {
  return useQuery({
    queryKey: projectKeys.list(query),
    queryFn: ({ signal }) => projectsService.list(query, signal),
    placeholderData: keepPreviousData, // keep rows visible while paging/sorting
  });
}

export function useProject(id: string) {
  return useQuery({ queryKey: projectKeys.detail(id), queryFn: ({ signal }) => projectsService.get(id, signal) });
}

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }) });
}

export const useCreateProject = () => useInvalidatingMutation(projectsService.create);
export const useUpdateProject = () =>
  useInvalidatingMutation(({ id, input }: { id: string; input: Partial<ProjectFormValues> }) => projectsService.update(id, input));
export const useDeleteProject = () => useInvalidatingMutation(projectsService.remove);
