import type { Metadata } from 'next';
import { AiPromptsPage } from '@nexus/features/ai';

export const metadata: Metadata = { title: 'Prompts' };

export default function Page() {
  return <AiPromptsPage />;
}
