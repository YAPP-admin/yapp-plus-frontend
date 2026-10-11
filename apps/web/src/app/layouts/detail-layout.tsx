import type { ReactNode } from 'react';
import { BackButton } from '../navigation/back-button';
import { PageShell } from './page-shell';

export function DetailLayout({ children, fallback }: { children: ReactNode; fallback: string }) {
  return <PageShell backButton={<BackButton fallback={fallback} />}>{children}</PageShell>;
}
