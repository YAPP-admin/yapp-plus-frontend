'use client';

import {
  IconArticleFill,
  IconCalendarFill,
  IconHouseFill,
  IconPersonFill,
} from '@karrotmarket/react-monochrome-icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    href: '/',
    label: '홈',
    Icon: IconHouseFill,
  },
  {
    href: '/schedule',
    label: '일정',
    Icon: IconCalendarFill,
  },
  {
    href: '/notices',
    label: '게시판',
    Icon: IconArticleFill,
  },
  {
    href: '/my',
    label: 'MY',
    Icon: IconPersonFill,
  },
];

export function BottomNavigation({
  activeTab,
}: {
  /** Stackflow Activity가 전달하면 URL adapter보다 우선합니다. */
  activeTab?: 'home' | 'schedule' | 'notices' | 'my' | null;
} = {}) {
  const pathname = usePathname();
  const activePathname = getActivePathname(activeTab, pathname);

  return (
    <div className={bottomBar}>
      <nav className={navigation} aria-label="주요 메뉴">
        {destinations.map(({ href, label, Icon }) => {
          const isCurrent = activePathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={item}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span className={iconWrapper} aria-hidden="true">
                <Icon width={24} height={24} />
              </span>
              <span className={itemLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={homeIndicatorArea} aria-hidden="true" />
    </div>
  );
}

function getActivePathname(
  activeTab: 'home' | 'schedule' | 'notices' | 'my' | null | undefined,
  pathname: string | null,
) {
  if (activeTab === undefined) {
    return pathname;
  }
  if (activeTab === null) {
    return undefined;
  }
  if (activeTab === 'home') {
    return '/';
  }
  return `/${activeTab}`;
}
