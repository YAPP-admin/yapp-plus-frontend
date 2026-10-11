import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { brand, header, navigation, navigationLink, shell } from './admin-shell.css';

export function AdminShell({ children }: { children: ReactNode }) {
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
        </nav>
      </header>
      {children}
    </div>
  );
}
