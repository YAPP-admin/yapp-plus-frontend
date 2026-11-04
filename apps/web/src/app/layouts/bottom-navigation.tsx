'use client';

import {
  IconArticleFill,
  IconCalendarFill,
  IconHouseFill,
  IconPersonFill,
} from '@karrotmarket/react-monochrome-icon';
import { TabLink } from '@/app/navigation/tab-link';
import type { TabName } from '@/app/navigation/tab';
import {
  bottomBar,
  homeIndicatorArea,
  iconWrapper,
  item,
  itemLabel,
  navigation,
} from './bottom-navigation.css';

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

export function BottomNavigation({ activeTab }: { activeTab: TabName | null }) {
  return (
    <div className={bottomBar}>
      <nav className={navigation} aria-label="주요 메뉴">
        {destinations.map(({ tab, label, Icon }) => {
          const isCurrent = activeTab === tab;

          return (
            <TabLink
              key={tab}
              tab={tab}
              className={item}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span className={iconWrapper} aria-hidden="true">
                <Icon width={24} height={24} />
              </span>
              <span className={itemLabel}>{label}</span>
            </TabLink>
          );
        })}
      </nav>
      <div className={homeIndicatorArea} aria-hidden="true" />
    </div>
  );
}
