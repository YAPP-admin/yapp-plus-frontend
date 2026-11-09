'use client';

/** 탭 화면에서는 SEED 탭 탐색을 제공하고 알림에서는 일반 복귀 링크를 제공합니다. */
import { Tabs, Text } from '@seed-design/react';
import type { ComponentProps } from 'react';
import {
  IconArticleFill,
  IconCalendarFill,
  IconHouseFill,
  IconPersonFill,
} from '@karrotmarket/react-monochrome-icon';
import { TabLink } from '@/app/navigation/tab-link';
import type { TabName } from '@/app/navigation/tab';
import { bottomBar, homeIndicatorArea, item, itemLabel, navigation } from './bottom-navigation.css';

const destinations = [
  {
    tab: 'home' as const,
    label: '홈',
    Icon: IconHouseFill,
  },
  {
    tab: 'schedule' as const,
    label: '일정',
    Icon: IconCalendarFill,
  },
  {
    tab: 'notices' as const,
    label: '게시판',
    Icon: IconArticleFill,
  },
  {
    tab: 'my' as const,
    label: 'MY',
    Icon: IconPersonFill,
  },
];

/** activeTab이 null이면 SEED Tabs context 없이 알림에서 탭으로 복귀하는 링크를 렌더링합니다. */
export function BottomNavigation({ activeTab }: { activeTab: TabName | null }) {
  const links = destinations.map(({ tab, label, Icon }) => {
    const content = (
      <>
        <Icon width={24} height={24} aria-hidden="true" />
        <Text textStyle="t2Bold" className={itemLabel}>
          {label}
        </Text>
      </>
    );

    return activeTab === null ? (
      <TabLink key={tab} tab={tab} className={item}>
        {content}
      </TabLink>
    ) : (
      <Tabs.Trigger key={tab} value={tab} asChild>
        <BottomTabLink
          tab={tab}
          className={item}
          aria-current={activeTab === tab ? 'page' : undefined}
        >
          {content}
        </BottomTabLink>
      </Tabs.Trigger>
    );
  });

  return (
    <div className={bottomBar}>
      <nav aria-label="주요 메뉴">
        {activeTab === null ? (
          <div className={navigation}>{links}</div>
        ) : (
          <Tabs.List className={navigation} aria-label="주요 메뉴">
            {links}
          </Tabs.List>
        )}
      </nav>
      <div className={homeIndicatorArea} aria-hidden="true" />
    </div>
  );
}

function BottomTabLink({
  onClick: _seedOnClick,
  type: _buttonType,
  ...props
}: ComponentProps<typeof TabLink>) {
  // 클릭 탐색은 TabLink가 소유하고, SEED의 키보드·포커스·ref 연결만 전달합니다.
  return <TabLink {...props} />;
}
