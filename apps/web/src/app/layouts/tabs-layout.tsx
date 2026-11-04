'use client';

import type { ReactNode } from 'react';
import type { TabName } from '../navigation/tab';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';
import { TabsHeader } from './tabs-header';

type TabsLayoutProps = {
  children: ReactNode;
  /** Stackflow Activity가 확정한 현재 탭입니다. */
  activeTab: TabName | null;
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
