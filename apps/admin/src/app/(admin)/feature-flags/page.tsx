import type { Metadata } from 'next';
import { FeatureFlagsPage } from '@nexus/features/feature-flags';

export const metadata: Metadata = { title: 'Feature Flags' };

export default function Page() {
  return <FeatureFlagsPage />;
}
