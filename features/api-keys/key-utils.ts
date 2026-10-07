import { EXPIRY_PRESETS, type ApiKey, type ApiKeyStatus, type ExpiryPreset } from './types';
import type { CreateApiKeyRequest, CreateApiKeyValues } from './schemas';

/** Display form of a key: prefix plus masked tail. The full secret is never reconstructable. */
export const maskKey = (key: Pick<ApiKey, 'prefix' | 'last4'>) => `${key.prefix}••••${key.last4}`;

export function expiryToDays(preset: ExpiryPreset): number | null {
  return EXPIRY_PRESETS.find((p) => p.value === preset)?.days ?? null;
}

export function toCreateRequest(values: CreateApiKeyValues): CreateApiKeyRequest {
  return { name: values.name, scopes: values.scopes, expiresInDays: expiryToDays(values.expiry) };
}

/** Revoked is terminal; otherwise a key is expired once its expiry date has passed. */
export function deriveStatus(key: Pick<ApiKey, 'revokedAt' | 'expiresAt'>, now = Date.now()): ApiKeyStatus {
  if (key.revokedAt) return 'revoked';
  if (key.expiresAt && new Date(key.expiresAt).getTime() <= now) return 'expired';
  return 'active';
}

export const canRevoke = (key: Pick<ApiKey, 'status'>) => key.status === 'active';

export function toggleScope(scopes: readonly string[], scope: string, checked: boolean): string[] {
  const set = new Set(scopes);
  if (checked) set.add(scope);
  else set.delete(scope);
  return [...set];
}
