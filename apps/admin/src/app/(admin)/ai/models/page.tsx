import type { Metadata } from 'next';
import { AiModelsPage } from '@nexus/features/ai';

export const metadata: Metadata = { title: 'AI Models' };

export default function Page() {
  return <AiModelsPage />;
}
