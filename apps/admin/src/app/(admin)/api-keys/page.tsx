import type { Metadata } from 'next';
import { ApiKeysPage } from '@nexus/features/api-keys';

export const metadata: Metadata = { title: 'API Keys' };

export default function Page() {
  return <ApiKeysPage />;
}
