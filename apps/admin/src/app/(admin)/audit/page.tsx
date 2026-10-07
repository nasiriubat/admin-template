import type { Metadata } from 'next';
import { AuditPage } from '@nexus/features/audit';

export const metadata: Metadata = { title: 'Audit Log' };

export default function Page() {
  return <AuditPage />;
}
