import type { ReactNode } from 'react';
import { PageShell } from './page-shell';

export function AuthLayout({ children }: { children: ReactNode }) {
  return <PageShell plain>{children}</PageShell>;
}
