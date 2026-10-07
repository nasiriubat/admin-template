import type { Metadata } from 'next';
import { BillingPage } from '@nexus/features/billing';

export const metadata: Metadata = { title: 'Billing' };

export default function Page() {
  return <BillingPage />;
}
