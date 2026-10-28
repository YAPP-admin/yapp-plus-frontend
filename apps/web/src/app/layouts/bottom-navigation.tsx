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
  homeIndicatorBar,
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

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className={bottomBar}>
      <nav className={navigation} aria-label="주요 메뉴">
        {destinations.map(({ href, label, Icon }) => {
          const isCurrent = pathname === href;

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
      <div className={homeIndicatorArea} aria-hidden="true">
        <div className={homeIndicatorBar} />
      </div>
    </div>
  );
}
