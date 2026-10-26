'use client';

import { IconBellFill } from '@karrotmarket/react-monochrome-icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bellButton, defaultTitle, homeHeader, logoLink } from './tabs-header.css';

const TAB_TITLES: Record<string, string> = {
  '/schedule': '일정',
  '/notices': '공지',
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
  return <span className={defaultTitle}>{title}</span>;
}
