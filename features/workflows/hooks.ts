'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import type { SaveWorkflowInput } from './schemas';
import { workflowsService } from './service';
import { REFRESH_INTERVAL_MS, type Workflow, type WorkflowGraph, type WorkflowStatus } from './types';

export const workflowKeys = {
  all: ['workflows'] as const,
  list: (query: ListQuery) => ['workflows', 'list', query] as const,
  detail: (id: string) => ['workflows', 'detail', id] as const,
  models: ['workflows', 'models'] as const,
  runs: ['workflow-runs'] as const,
  runList: (query: ListQuery) => ['workflow-runs', 'list', query] as const,
  runStats: ['workflow-runs', 'stats'] as const,
};

export function useWorkflows(query: ListQuery) {
  return useQuery({ queryKey: workflowKeys.list(query), queryFn: ({ signal }) => workflowsService.list(query, signal), placeholderData: keepPreviousData });
}

export function useWorkflow(id: string) {
  return useQuery({ queryKey: workflowKeys.detail(id), queryFn: ({ signal }) => workflowsService.get(id, signal), staleTime: Infinity, refetchOnWindowFocus: false });
}

export function useWorkflowModels() {
  return useQuery({ queryKey: workflowKeys.models, queryFn: ({ signal }) => workflowsService.models(signal), staleTime: 60_000 });
}

export function useWorkflowRuns(query: ListQuery, autoRefresh: boolean) {
  return useQuery({ queryKey: workflowKeys.runList(query), queryFn: ({ signal }) => workflowsService.runs.list(query, signal), placeholderData: keepPreviousData, refetchInterval: autoRefresh ? REFRESH_INTERVAL_MS : false });
}

export function useRunStats(autoRefresh: boolean) {
  return useQuery({ queryKey: workflowKeys.runStats, queryFn: ({ signal }) => workflowsService.runs.stats(signal), refetchInterval: autoRefresh ? REFRESH_INTERVAL_MS : false });
}

function useInvalidating<TVars, TData>(fn: (vars: TVars) => Promise<TData>, keys: ReadonlyArray<readonly string[]> = [workflowKeys.all, workflowKeys.runs]) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey }))) });
}

export const useCreateWorkflow = () => useInvalidating(workflowsService.create);
export const useDeleteWorkflow = () => useInvalidating(workflowsService.remove);
export const useDuplicateWorkflow = () => useInvalidating(workflowsService.duplicate);
export const useRunWorkflow = () => useInvalidating(workflowsService.run);
export const useSetWorkflowStatus = () => useInvalidating(({ id, status }: { id: string; status: WorkflowStatus }) => workflowsService.setStatus(id, status));
export const useRetryRun = () => useInvalidating(workflowsService.runs.retry, [workflowKeys.runs]);
export const useCancelRun = () => useInvalidating(workflowsService.runs.cancel, [workflowKeys.runs]);
export const useApproveRun = () => useInvalidating(workflowsService.runs.approve, [workflowKeys.runs]);
export const useRejectRun = () => useInvalidating(workflowsService.runs.reject, [workflowKeys.runs]);

/** Builder mutations write the result straight into the detail cache so the editor never refetches mid-edit. */
function useDetailMutation<TVars>(fn: (vars: TVars) => Promise<Workflow>, idOf: (vars: TVars) => string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      qc.setQueryData(workflowKeys.detail(idOf(vars)), data);
      void qc.invalidateQueries({ queryKey: ['workflows', 'list'] });
    },
  });
}

export const useSaveWorkflow = () => useDetailMutation(({ id, input }: { id: string; input: SaveWorkflowInput }) => workflowsService.save(id, input), (v) => v.id);
export const useRestoreVersion = () => useDetailMutation(({ id, version }: { id: string; version: number }) => workflowsService.restore(id, version), (v) => v.id);
export const useBuilderStatus = () => useDetailMutation(({ id, status }: { id: string; status: WorkflowStatus }) => workflowsService.setStatus(id, status), (v) => v.id);
export function useTestRun() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, graph }: { id: string; graph: WorkflowGraph }) => workflowsService.test(id, graph), onSuccess: () => qc.invalidateQueries({ queryKey: workflowKeys.runs }) });
}
export const useRotateSecret = () => useMutation({ mutationFn: workflowsService.rotateWebhookSecret });
