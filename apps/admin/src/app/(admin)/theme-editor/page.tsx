import type { Metadata } from 'next';
import { ThemeEditorPage } from '@nexus/features/theme';

export const metadata: Metadata = { title: 'Theme & Styling' };

export default function Page() {
  return <ThemeEditorPage />;
}
