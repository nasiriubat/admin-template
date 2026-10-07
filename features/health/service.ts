import { api } from '../_shared/api';
import type { HealthSnapshot } from './types';

export const healthService = {
  snapshot: (signal?: AbortSignal) => api.get<HealthSnapshot>('/health', { signal }),
};
