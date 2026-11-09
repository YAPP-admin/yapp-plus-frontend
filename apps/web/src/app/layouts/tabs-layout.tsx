'use client';

/** Stackflow가 소유한 탭 선택을 SEED의 키보드 탐색·패널 관계에 연결합니다. */
import { Tabs } from '@seed-design/react';
import { useContext, type ReactNode } from 'react';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { isTabName, type TabName } from '../navigation/tab';
import { BottomNavigation } from './bottom-navigation';
import { PageShell } from './page-shell';
import { TabsHeader } from './tabs-header';
import { panel, tabShell } from './tabs-layout.css';

type TabsLayoutProps = {
  children: ReactNode;
} & (
  | { activeTab: TabName; onTabChange: (tab: TabName) => void }
  | { activeTab: null; onTabChange?: never }
);

/** 선택은 호출자가 확정하며, null인 알림 화면은 탭 패널 없이 기존 메뉴를 표시합니다. */
export function TabsLayout({ children, activeTab, onTabChange }: TabsLayoutProps) {
  const shell = (
    <PageShell
      className={activeTab === null ? undefined : tabShell}
      navigation={<BottomNavigation activeTab={activeTab} />}
      borderlessHeader
      header={<TabsHeader activeTab={activeTab} />}
    >
      {children}
    </PageShell>
  );

  if (activeTab === null) {
    return shell;
  }

  return (
    <Tabs.Root
      lazyMount
      unmountOnExit={false}
      value={activeTab}
      onValueChange={(value) => {
        if (isTabName(value) && value !== activeTab) {
          onTabChange(value);
        }
      }}
    >
      {shell}
    </Tabs.Root>
  );
}

/** 방문한 패널의 DOM·스크롤은 SEED가 유지하며, 활성 상태는 observer 제어에 제공합니다. */
export function TabPanel({
  tab,
  active,
  children,
}: {
  tab: TabName;
  active: boolean;
  children: ReactNode;
}) {
  const screenActive = useContext(ScreenActiveContext);
  return (
    <Tabs.Content value={tab} className={panel} inert={!active}>
      <ScreenActiveContext value={screenActive && active}>{children}</ScreenActiveContext>
    </Tabs.Content>
  );
}
