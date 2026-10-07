import type { Metadata } from 'next';
import { KnowledgeDocumentsPage } from '@nexus/features/knowledge';

export const metadata: Metadata = { title: 'Knowledge Documents' };

export default function Page() {
  return <KnowledgeDocumentsPage />;
}
