import type { Metadata } from 'next';
import { AiProvidersPage } from '@nexus/features/ai';

export const metadata: Metadata = { title: 'AI Providers' };

export default function Page() {
  return <AiProvidersPage />;
}
