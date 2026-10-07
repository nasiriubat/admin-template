import type { Metadata } from 'next';
import { UserDetailPage } from '@nexus/features/users';

export const metadata: Metadata = { title: 'User details' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage id={id} />;
}
