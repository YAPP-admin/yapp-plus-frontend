'use client';

import { IconBellFill } from '@karrotmarket/react-monochrome-icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  bellButton,
  defaultHeader,
  defaultTitle,
  headerActionButton,
  homeHeader,
  logoLink,
} from './tabs-header.css';

const TAB_TITLES: Record<string, string> = {
  '/schedule': '일정',
  '/notices': '게시판',
  '/my': '마이페이지',
};

export function TabsHeader() {
  const pathname = usePathname();

  if (pathname === '/') {
    return (
      <div className={homeHeader}>
        <Link href="/" className={logoLink} aria-label="YAPP 홈">
          <Image src="/images/home/yapp-logo.svg" alt="YAPP" width={80} height={30} priority />
        </Link>
        <Link href="/notices" className={bellButton} aria-label="알림">
          <IconBellFill width={24} height={24} />
        </Link>
      </div>
    );
  }

  const title = (pathname ? TAB_TITLES[pathname] : undefined) ?? 'YAPP+';
  return (
    <div className={defaultHeader}>
      <span className={defaultTitle}>{title}</span>
      {pathname === '/my' ? (
        <Link href="/settings" className={headerActionButton} aria-label="설정">
          <Image src="/images/my/settings.svg" alt="" width={24} height={24} />
        </Link>
      ) : null}
    </div>
  );
}
