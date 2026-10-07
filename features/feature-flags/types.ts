export type FlagEnvironment = 'production' | 'staging' | 'development';

export const FLAG_ENVIRONMENTS: ReadonlyArray<{ value: FlagEnvironment; label: string }> = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
];

export interface FeatureFlag {
  id: string;
  /** kebab-case identifier used by SDKs. Unique. */
  key: string;
  description: string;
  environments: Record<FlagEnvironment, boolean>;
  /** Percentage of users (0-100) who get the flag when it is enabled. */
  rollout: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type FlagStatusFilter = 'enabled' | 'disabled';
