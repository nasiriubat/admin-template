import type { ApiErrorBody } from './types';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

/** Every failure the UI can show maps to one of these, so pages render consistent states. */
export class ApiError extends Error {
  readonly code: ApiErrorCode | (string & {});
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: ApiError['code'], message: string, status = 0, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  get isUnauthorized() {
    return this.code === 'UNAUTHENTICATED' || this.status === 401;
  }
  get isForbidden() {
    return this.code === 'FORBIDDEN' || this.status === 403;
  }
  get isNetwork() {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }
  /** Worth offering a "Try again" button. */
  get isRetryable() {
    return this.isNetwork || this.status >= 500 || this.code === 'RATE_LIMITED';
  }
}

export function codeForStatus(status: number): ApiErrorCode {
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHENTICATED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

export function toApiError(status: number, body: ApiErrorBody | null | undefined): ApiError {
  const code = body?.code ?? codeForStatus(status);
  const message = body?.message ?? defaultMessage(code);
  return new ApiError(code, message, status, body?.fields);
}

function defaultMessage(code: string): string {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 'Your session has expired. Please sign in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to do that.';
    case 'NOT_FOUND':
      return 'We could not find what you were looking for.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again.';
    case 'NETWORK_ERROR':
      return 'Network error. Check your connection and try again.';
    case 'TIMEOUT':
      return 'The request timed out. Please try again.';
    case 'VALIDATION_ERROR':
      return 'Some of the information provided is not valid.';
    default:
      return 'Something went wrong on our side. Please try again.';
  }
}
