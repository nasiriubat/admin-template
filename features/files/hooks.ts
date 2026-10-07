'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { filesService } from './service';

export const fileKeys = {
  all: ['files'] as const,
  list: (query: ListQuery) => ['files', 'list', query] as const,
};

export function useFiles(query: ListQuery) {
  return useQuery({
    queryKey: fileKeys.list(query),
    queryFn: ({ signal }) => filesService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }) });
}

export const useUploadFile = () => useInvalidatingMutation(filesService.upload);
export const useRenameFile = () => useInvalidatingMutation(({ id, name }: { id: string; name: string }) => filesService.rename(id, name));
export const useDeleteFile = () => useInvalidatingMutation(filesService.remove);
