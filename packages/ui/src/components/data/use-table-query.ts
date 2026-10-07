'use client';

import { useCallback, useState } from 'react';

export interface TableQuery {
  page: number;
  pageSize: number;
  sort?: string;
  direction: 'asc' | 'desc';
  search: string;
}

export interface UseTableQuery {
  query: TableQuery;
  setQuery: (patch: Partial<TableQuery>) => void;
  reset: () => void;
}

/**
 * Owns search / sort / pagination state for a DataTable. Any change except page navigation
 * returns to page 1 so users never land on a page that no longer exists.
 */
export function useTableQuery(initial: Partial<TableQuery> = {}): UseTableQuery {
  const base: TableQuery = { page: 1, pageSize: 10, direction: 'asc', search: '', ...initial };
  const [query, setState] = useState<TableQuery>(base);

  const setQuery = useCallback((patch: Partial<TableQuery>) => {
    setState((prev) => ({ ...prev, ...patch, page: 'page' in patch ? (patch.page as number) : 1 }));
  }, []);

  const reset = useCallback(() => setState(base), []); // eslint-disable-line react-hooks/exhaustive-deps

  return { query, setQuery, reset };
}
