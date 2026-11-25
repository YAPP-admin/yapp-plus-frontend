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
import { ActivityLink } from '@/app/navigation/activity-link';
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

const COMMUNITY_DESTINATION = {
  label: '커뮤니티',
  Icon: IconStarFill,
};

/** activeTab이 null이면 SEED Tabs context 없이 알림에서 탭으로 복귀하는 링크를 렌더링합니다. */
export function BottomNavigation({ activeTab }: { activeTab: TabName | 'community' | null }) {
  const isTabNavigation = activeTab !== null && activeTab !== 'community';
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

  const { label, Icon } = COMMUNITY_DESTINATION;
  const current = activeTab === 'community';
  links.splice(
    links.length - 1,
    0,
    <VStack key="community" asChild align="center" justify="center" gap="x1">
      <ActivityLink
        activityName="DiningList"
        activityParams={{}}
        className={item}
        aria-current={current ? 'page' : undefined}
        onClick={(event) => {
          if (current) {
            event.preventDefault();
          }
        }}
      >
        <Icon width={24} height={24} aria-hidden="true" />
        <Text textStyle="t2Bold" className={itemLabel}>
          {label}
        </Text>
      </ActivityLink>
    </VStack>,
  );

  return (
    <VStack className={bottomBar}>
      <Box as="nav" aria-label="주요 메뉴">
        {isTabNavigation ? (
          <Tabs.List asChild aria-label="주요 메뉴">
            <Grid columns={5} className={navigation}>
              {links}
            </Grid>
          </Tabs.List>
        ) : (
          <Grid columns={5} className={navigation}>
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
