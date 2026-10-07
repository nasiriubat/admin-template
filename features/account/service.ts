import { api } from '../_shared/api';
import type { AccountSession, LoginEvent, Profile } from './types';

export const accountService = {
  getProfile: (signal?: AbortSignal) => api.get<Profile>('/account/profile', { signal }),
  updateProfile: (input: Profile) => api.patch<Profile>('/account/profile', input),
  changePassword: (input: { current: string; password: string; confirm: string }) => api.post<{ changed: boolean }>('/account/password', input),
  listSessions: (signal?: AbortSignal) => api.get<AccountSession[]>('/account/sessions', { signal }),
  revokeSession: (id: string) => api.delete(`/account/sessions/${encodeURIComponent(id)}`),
  revokeOtherSessions: () => api.post<{ revoked: number }>('/account/sessions/revoke-others'),
  loginHistory: (signal?: AbortSignal) => api.get<LoginEvent[]>('/account/login-history', { signal }),
};
