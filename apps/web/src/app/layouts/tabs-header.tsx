'use client';

/** 현재 탭의 제목과 보조 탐색을 SEED 레이아웃으로 표시합니다. */
import { HStack, Text } from '@seed-design/react';

import { IconBellFill, IconGearFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Image } from '@/app/navigation/image';
import { TabLink } from '@/app/navigation/tab-link';
import type { TabName } from '@/app/navigation/tab';
import {
  bellButton,
  defaultHeader,
  defaultTitle,
  headerActionButton,
  homeHeader,
  logoLink,
} from './tabs-header.css';

const TAB_TITLES: Partial<Record<TabName, string>> = {
  schedule: '일정',
  notices: '게시판',
  my: '마이페이지',
};

type TabsHeaderProps = {
  activeTab: TabName | null;
};

export function TabsHeader({ activeTab }: TabsHeaderProps) {
  if (activeTab === 'home') {
    return (
      <HStack
        align="center"
        justify="space-between"
        px="x4"
        py="x3"
        bg="bg.layerBasement"
        className={homeHeader}
      >
        <TabLink tab="home" className={logoLink} aria-label="YAPP 홈">
          <Image src="/images/home/yapp-logo.svg" alt="YAPP" width={80} height={30} />
        </TabLink>
        <ActivityLink
          activityName="Alerts"
          activityParams={{}}
          className={bellButton}
          aria-label="알림"
        >
          <IconBellFill width={24} height={24} />
        </ActivityLink>
      </HStack>
    );
  }

  if (activeTab === null) {
    return null;
  }

  const title = TAB_TITLES[activeTab] ?? 'YAPP+';
  return (
    <HStack
      align="center"
      justify="space-between"
      px="x5"
      bg="bg.layerDefault"
      className={defaultHeader}
    >
      <Text as="h1" textStyle="t8Bold" color="fg.neutral" className={defaultTitle}>
        {title}
      </Text>
      {activeTab === 'my' ? (
        <ActivityLink
          activityName="Settings"
          activityParams={{}}
          className={headerActionButton}
          aria-label="설정"
        >
          <IconGearFill width={24} height={24} />
        </ActivityLink>
      ) : null}
    </HStack>
  );
}
