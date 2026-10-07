'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from './service';
import type { SettingsCategory, WorkspaceSettings } from './types';

export const settingsKeys = { all: ['settings'] as const };

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: ({ signal }) => settingsService.get(signal) });
}

export function useSaveSettings<C extends SettingsCategory>(category: C) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: WorkspaceSettings[C]) => settingsService.save(category, values),
    onSuccess: (saved) => qc.setQueryData<WorkspaceSettings>(settingsKeys.all, (prev) => (prev ? { ...prev, [category]: saved } : prev)),
  });
}

export function useResetDemoData() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: settingsService.resetDemoData, onSuccess: () => qc.invalidateQueries() });
}

export const useDeleteWorkspace = () => useMutation({ mutationFn: settingsService.deleteWorkspace });
