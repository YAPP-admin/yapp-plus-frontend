'use client';

import type { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';
import { TabsHeader } from './tabs-header';

export function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell navigation={<BottomNavigation />} borderlessHeader header={<TabsHeader />}>
      {children}
    </PageShell>
  );
}
