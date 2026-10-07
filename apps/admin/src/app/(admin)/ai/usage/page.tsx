import type { Metadata } from 'next';
import { AiUsagePage } from '@nexus/features/ai';

export const metadata: Metadata = { title: 'AI Usage' };

export default function Page() {
  return <AiUsagePage />;
}
