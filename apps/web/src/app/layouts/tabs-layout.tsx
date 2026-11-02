'use client';

import type { ReactNode } from 'react';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';
import { TabsHeader } from './tabs-header';

type TabsLayoutProps = {
  children: ReactNode;
  /** Stackflow Activity가 URL보다 먼저 확정한 현재 탭입니다. */
  activeTab?: 'home' | 'schedule' | 'notices' | 'my' | null;
};

export function TabsLayout({ children, activeTab }: TabsLayoutProps) {
  return (
    <PageShell
      navigation={<BottomNavigation activeTab={activeTab} />}
      borderlessHeader
      header={<TabsHeader activeTab={activeTab} />}
    >
      {children}
    </PageShell>
  );
}
