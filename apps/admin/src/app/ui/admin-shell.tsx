/** 반응형 표시는 SEED의 CSS로 처리하여 첫 화면부터 탐색 영역의 너비를 유지한다. */
import { Badge, Box, SideNavigation, Text, useBreakpointValue } from '@seed-design/react';
import { useMatches } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminMobileNavigation } from './admin-mobile-navigation';
import { navigationItems } from './admin-navigation';
import * as styles from './admin-shell.css';

export function AdminShell({ children }: { children: ReactNode }) {
  const isNarrow = useBreakpointValue({ base: true, lg: false });
  const navigation = useMatches({
    select: (matches) => matches.at(-1)?.staticData.navigation,
  });
  if (!navigation) {
    throw new Error('관리자 페이지의 staticData.navigation 설정이 필요합니다.');
  }
  const currentItem = navigationItems[navigation.menu];

  return (
    <div className={styles.shell} data-seed-color-mode="dark-only">
      <SideNavigation.Provider collapsed={false}>
        <Box
          display={{ base: 'none', lg: 'block' }}
          position="sticky"
          top="0"
          height="100dvh"
          flexShrink={0}
        >
          <AdminSidebar menu={navigation.menu} />
        </Box>
        <div className={styles.workspace}>
          <header className={styles.header}>
            <Box hideFrom="lg" flexShrink={0}>
              {/* 화면 너비 훅은 데스크톱 전환 시 열린 모바일 패널을 해제하는 데만 사용한다. */}
              {isNarrow && <AdminMobileNavigation menu={navigation.menu} />}
            </Box>
            <nav aria-label="현재 위치">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Text textStyle="t3Regular" color="fg.neutralMuted">
                    {currentItem.section}
                  </Text>
                </li>
                <li aria-hidden="true" className={styles.separator}>
                  /
                </li>
                <li aria-current="page">
                  <Text textStyle="t3Bold">{navigation.pageLabel}</Text>
                </li>
              </ol>
            </nav>
            {import.meta.env.DEV && (
              <Badge className={styles.environmentBadge} variant="weak" tone="informative">
                개발 환경
              </Badge>
            )}
          </header>
          <div className={styles.content}>{children}</div>
        </div>
      </SideNavigation.Provider>
    </div>
  );
}
