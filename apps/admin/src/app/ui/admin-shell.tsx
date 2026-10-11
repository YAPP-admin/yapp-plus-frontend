import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { brand, header, navigation, navigationLink, shell } from './admin-shell.css';

export function AdminShell({ children }: { children: ReactNode }) {
  const isSessionAttendance = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/_dashboard/attendance/$sessionId'),
  });
  return (
    <div className={shell}>
      <header className={header}>
        <Link className={brand} to="/" search={{}}>
          YAPP+ Admin
        </Link>
        <nav className={navigation} aria-label="주요 메뉴">
          <Link
            className={navigationLink}
            to="/"
            search={{}}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            대시보드
          </Link>
          <Link
            className={navigationLink}
            to="/sessions"
            search={{}}
            activeOptions={{ includeSearch: false }}
          >
            세션 관리
          </Link>
          <Link
            className={navigationLink}
            to="/attendance"
            search={{}}
            activeOptions={{ exact: true, includeSearch: false }}
            inactiveProps={isSessionAttendance ? { 'aria-current': 'location' } : {}}
          >
            출석부
          </Link>
          <Link
            className={navigationLink}
            to="/attendance/scores"
            search={{}}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            출석 총점
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
