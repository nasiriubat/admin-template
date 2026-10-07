import type { Metadata } from 'next';
import { RolesPage } from '@nexus/features/roles';

export const metadata: Metadata = { title: 'Roles & Permissions' };

export default function Page() {
  return <RolesPage />;
}
