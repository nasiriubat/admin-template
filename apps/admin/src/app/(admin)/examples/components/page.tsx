import type { Metadata } from 'next';
import { ComponentGalleryPage } from '@nexus/features/examples';

export const metadata: Metadata = { title: 'Component gallery' };

export default function Page() {
  return <ComponentGalleryPage />;
}
