import type { ReactNode } from 'react';
import { BrandMark, Card } from '@nexus/ui';
import { appConfig } from '../../lib/app-config';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4 py-10 pt-safe pb-safe">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-12 text-xl" />
          <p className="text-sm font-medium text-text-muted">{appConfig.name}</p>
        </div>
        <Card className="p-6 sm:p-8">{children}</Card>
      </div>
    </main>
  );
}
