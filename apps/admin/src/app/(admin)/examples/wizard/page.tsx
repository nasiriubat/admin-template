import type { Metadata } from 'next';
import { WizardPage } from '@nexus/features/examples';

export const metadata: Metadata = { title: 'Wizard form' };

export default function Page() {
  return <WizardPage />;
}
