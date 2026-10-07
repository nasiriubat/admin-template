import type { Metadata } from 'next';
import { FilesPage } from '@nexus/features/files';

export const metadata: Metadata = { title: 'Files' };

export default function Page() {
  return <FilesPage />;
}
