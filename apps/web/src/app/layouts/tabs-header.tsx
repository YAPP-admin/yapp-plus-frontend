'use client';

import { IconBellFill, IconGearFill } from '@karrotmarket/react-monochrome-icon';
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
  '/alerts': '알림',
};

type TabsHeaderProps = {
  /** Stackflow Activity가 전달하면 URL adapter보다 우선합니다. */
  activeTab?: 'home' | 'schedule' | 'notices' | 'my' | null;
};

export function TabsHeader({ activeTab }: TabsHeaderProps = {}) {
  const pathname = usePathname();
  const activePathname = getActivePathname(activeTab, pathname);

  if (activePathname === '/') {
    return (
      <div className={homeHeader}>
        <Link href="/" className={logoLink} aria-label="YAPP 홈">
          <Image src="/images/home/yapp-logo.svg" alt="YAPP" width={80} height={30} priority />
        </Link>
        <Link href="/alerts" className={bellButton} aria-label="알림">
          <IconBellFill width={24} height={24} />
        </Link>
      </div>
    );
  }

  if (activePathname === '/alerts') {
    return null;
  }

  const title = (activePathname ? TAB_TITLES[activePathname] : undefined) ?? 'YAPP+';
  return (
    <div className={defaultHeader}>
      <span className={defaultTitle}>{title}</span>
      {activePathname === '/my' ? (
        <Link href="/settings" className={headerActionButton} aria-label="설정">
          <IconGearFill width={24} height={24} />
        </Link>
      ) : null}
    </div>
  );
}

function getActivePathname(activeTab: TabsHeaderProps['activeTab'], pathname: string) {
  if (activeTab === undefined) {
    return pathname;
  }
  if (activeTab === null) {
    return '/alerts';
  }
  if (activeTab === 'home') {
    return '/';
  }
  return `/${activeTab}`;
}
