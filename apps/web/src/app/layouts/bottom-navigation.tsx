'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { item, navigation } from './bottom-navigation.css';

const destinations = [
  { href: '/', label: '홈' },
  { href: '/schedule', label: '일정' },
  { href: '/notices', label: '공지' },
  { href: '/my', label: '마이페이지' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={navigation} aria-label="주요 메뉴">
      {destinations.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={item}
          aria-current={pathname === href ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
