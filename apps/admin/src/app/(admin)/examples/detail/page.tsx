import type { Metadata } from 'next';
import { DetailExamplePage } from '@nexus/features/examples';

export const metadata: Metadata = { title: 'Detail page' };

export default function Page() {
  return <DetailExamplePage />;
}
