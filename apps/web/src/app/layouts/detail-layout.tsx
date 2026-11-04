import type { ReactNode } from 'react';
import { BackButton } from '../navigation/back-button';
import { PageShell } from './page-shell';

export function DetailLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell
      backButton={<BackButton fallbackActivityName="Attendance" fallbackActivityParams={{}} />}
    >
      {children}
    </PageShell>
  );
}
