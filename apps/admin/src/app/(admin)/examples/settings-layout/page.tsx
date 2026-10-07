import type { Metadata } from 'next';
import { SettingsLayoutPage } from '@nexus/features/examples';

export const metadata: Metadata = { title: 'Settings layout' };

export default function Page() {
  return <SettingsLayoutPage />;
}
