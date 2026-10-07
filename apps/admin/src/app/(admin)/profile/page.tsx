import type { Metadata } from 'next';
import { ProfilePage } from '@nexus/features/account';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <ProfilePage />;
}
