'use client';

import { BackButton } from '@/app/navigation/back-button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  body,
  bottomSection,
  container,
  header,
  headerSpacer,
  headerTitle,
  logoutButton,
  menuChevron,
  menuItem,
  menuLabel,
  menuList,
  toggleThumb,
  toggleTrack,
} from './settings-page.css';

const SETTINGS_LINKS = [
  {
    id: 'privacy',
    label: '개인정보 처리 방침',
    href: 'https://yapp.co.kr/privacy',
  },
  {
    id: 'terms',
    label: '이용 약관',
    href: 'https://yapp.co.kr/terms',
  },
  {
    id: 'withdraw',
    label: '회원 탈퇴',
    href: 'https://pf.kakao.com/_xkxmxjxd',
  },
];

export function SettingsPage() {
  const router = useRouter();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const handleToggleNotification = () => {
    setIsNotificationEnabled((prev) => !prev);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/my" iconOnly />
        <h1 className={headerTitle}>설정</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={menuList} aria-label="설정 메뉴">
          <div className={menuItem}>
            <span className={menuLabel}>알림</span>
            <button
              type="button"
              role="switch"
              aria-checked={isNotificationEnabled}
              aria-label="알림 설정"
              className={toggleTrack}
              data-checked={isNotificationEnabled}
              onClick={handleToggleNotification}
            >
              <span className={toggleThumb} aria-hidden="true" />
            </button>
          </div>

          {SETTINGS_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={menuItem}
            >
              <span className={menuLabel}>{link.label}</span>
              <Image
                src="/images/my/chevron-right.svg"
                alt=""
                width={24}
                height={24}
                className={menuChevron}
              />
            </a>
          ))}
        </section>

        <section className={bottomSection} aria-label="계정 관리">
          <button type="button" className={logoutButton} onClick={handleLogout}>
            로그아웃
          </button>
        </section>
      </main>
    </div>
  );
}
