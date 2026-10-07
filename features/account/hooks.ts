'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService } from './service';
import type { Profile } from './types';

export const accountKeys = {
  profile: ['account', 'profile'] as const,
  sessions: ['account', 'sessions'] as const,
  history: ['account', 'login-history'] as const,
};

export const useProfile = () => useQuery({ queryKey: accountKeys.profile, queryFn: ({ signal }) => accountService.getProfile(signal) });
export const useSessions = () => useQuery({ queryKey: accountKeys.sessions, queryFn: ({ signal }) => accountService.listSessions(signal) });
export const useLoginHistory = () => useQuery({ queryKey: accountKeys.history, queryFn: ({ signal }) => accountService.loginHistory(signal) });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Profile) => accountService.updateProfile(input),
    onSuccess: (saved) => qc.setQueryData(accountKeys.profile, saved),
  });
}

export const useChangePassword = () => useMutation({ mutationFn: accountService.changePassword });

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: accountService.revokeSession, onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.sessions }) });
}

export function useRevokeOtherSessions() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: accountService.revokeOtherSessions, onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.sessions }) });
}
