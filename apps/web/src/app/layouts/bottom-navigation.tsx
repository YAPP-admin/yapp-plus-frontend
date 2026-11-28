'use client';

/** 탭 화면에서는 SEED 탭 탐색을 제공하고 알림에서는 일반 복귀 링크를 제공합니다. */
import { Box, Grid, Tabs, Text, VStack } from '@seed-design/react';
import type { ComponentProps } from 'react';
import {
  IconArticleFill,
  IconCalendarFill,
  IconHouseFill,
  IconPersonFill,
  IconStarFill,
} from '@karrotmarket/react-monochrome-icon';
import { TabLink } from '@/app/navigation/tab-link';
import type { TabName } from '@/app/navigation/tab';
import { bottomBar, homeIndicatorArea, item, itemLabel, navigation } from './bottom-navigation.css';

const DESTINATIONS = [
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
    tab: 'community' as const,
    label: '커뮤니티',
    Icon: IconStarFill,
  },
  {
    tab: 'my' as const,
    label: 'MY',
    Icon: IconPersonFill,
  },
];

/** activeTab이 null이면 SEED Tabs context 없이 알림에서 탭으로 복귀하는 링크를 렌더링합니다. */
export function BottomNavigation({ activeTab }: { activeTab: TabName | null }) {
  const isTabNavigation = activeTab !== null;
  // 커뮤니티 진입 메뉴는 개발 실행에서만 노출하고 기존 직접 진입 경로는 유지합니다.
  const destinations = DESTINATIONS.filter(({ tab }) => tab !== 'community' || import.meta.env.DEV);
  const links = destinations.map(({ tab, label, Icon }) => {
    const content = (
      <>
        <Icon width={24} height={24} aria-hidden="true" />
        <Text textStyle="t2Bold" className={itemLabel}>
          {label}
        </Text>
      </>
    );

    if (isTabNavigation) {
      return (
        <Tabs.Trigger key={tab} value={tab} asChild>
          <VStack asChild align="center" justify="center" gap="x1">
            <BottomTabLink
              tab={tab}
              className={item}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {content}
            </BottomTabLink>
          </VStack>
        </Tabs.Trigger>
      );
    }

    return (
      <VStack key={tab} asChild align="center" justify="center" gap="x1">
        <TabLink tab={tab} className={item}>
          {content}
        </TabLink>
      </VStack>
    );
  });

  return (
    <VStack className={bottomBar}>
      <Box as="nav" aria-label="주요 메뉴">
        {isTabNavigation ? (
          <Tabs.List asChild aria-label="주요 메뉴">
            <Grid columns={destinations.length} className={navigation}>
              {links}
            </Grid>
          </Tabs.List>
        ) : (
          <Grid columns={destinations.length} className={navigation}>
            {links}
          </Grid>
        )}
      </Box>
      <Box className={homeIndicatorArea} aria-hidden="true" />
    </VStack>
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
