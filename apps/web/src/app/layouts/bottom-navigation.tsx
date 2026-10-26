'use client';

import {
  IconArticleFill,
  IconArticleLine,
  IconCalendarFill,
  IconCalendarLine,
  IconHouseFill,
  IconHouseLine,
  IconPersonFill,
  IconPersonLine,
} from '@karrotmarket/react-monochrome-icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { iconWrapper, item, itemLabel, navigation } from './bottom-navigation.css';

const destinations = [
  {
    href: '/',
    label: '홈',
    ActiveIcon: IconHouseFill,
    InactiveIcon: IconHouseLine,
  },
  {
    href: '/schedule',
    label: '일정',
    ActiveIcon: IconCalendarFill,
    InactiveIcon: IconCalendarLine,
  },
  {
    href: '/notices',
    label: '공지',
    ActiveIcon: IconArticleFill,
    InactiveIcon: IconArticleLine,
  },
  {
    href: '/my',
    label: '마이페이지',
    ActiveIcon: IconPersonFill,
    InactiveIcon: IconPersonLine,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={navigation} aria-label="주요 메뉴">
      {destinations.map(({ href, label, ActiveIcon, InactiveIcon }) => {
        const isCurrent = pathname === href;
        const IconComponent = isCurrent ? ActiveIcon : InactiveIcon;

        return (
          <Link
            key={href}
            href={href}
            className={item}
            aria-current={isCurrent ? 'page' : undefined}
          >
            <span className={iconWrapper} aria-hidden="true">
              <IconComponent width={24} height={24} />
            </span>
            <span className={itemLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
