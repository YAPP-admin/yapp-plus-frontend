import type { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';

export function TabsLayout({ children }: { children: ReactNode }) {
  return <PageShell navigation={<BottomNavigation />}>{children}</PageShell>;
}
