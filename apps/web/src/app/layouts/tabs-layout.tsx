'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';

import { TabsHeader } from './tabs-header';

export function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <PageShell navigation={<BottomNavigation />} borderlessHeader={isHome} header={<TabsHeader />}>
      {children}
    </PageShell>
  );
}
