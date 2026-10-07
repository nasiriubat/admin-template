import type { Metadata } from 'next';
import { KnowledgeSourcesPage } from '@nexus/features/knowledge';

export const metadata: Metadata = { title: 'Knowledge Sources' };

export default function Page() {
  return <KnowledgeSourcesPage />;
}
