import type { Metadata } from 'next';
import { ProjectsCrudPage } from '@nexus/features/examples';

export const metadata: Metadata = { title: 'CRUD scaffold' };

export default function Page() {
  return <ProjectsCrudPage />;
}
