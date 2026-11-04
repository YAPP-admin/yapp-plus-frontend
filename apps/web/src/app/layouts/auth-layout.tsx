'use client';

import type { ReactNode } from 'react';
import { BackButton } from '../navigation/back-button';
import { PageShell } from './page-shell';

export function AuthLayout({
  children,
  showBack = false,
}: {
  children: ReactNode;
  showBack?: boolean;
}) {
  return (
    <PageShell
      plain
      backButton={
        showBack ? (
          <BackButton fallbackActivityName="Login" fallbackActivityParams={{}} iconOnly />
        ) : undefined
      }
    >
      {children}
    </PageShell>
  );
}
