import type { ReactNode } from 'react';
import {
  header,
  headerPlain,
  shell,
  shellPlain,
  shellWithNavigation,
  wordmark,
} from './page-shell.css';

function getShellClassName(plain: boolean, hasNavigation: boolean) {
  if (plain) {
    return shellPlain;
  }
  return hasNavigation ? shellWithNavigation : shell;
}

export function PageShell({
  children,
  navigation,
  backButton,
  plain = false,
}: {
  children: ReactNode;
  navigation?: ReactNode;
  backButton?: ReactNode;
  /** 인증 화면용입니다. YAPP+ 문구와 구분선을 숨기고 흰색 배경을 사용합니다. */
  plain?: boolean;
}) {
  return (
    <div className={getShellClassName(plain, Boolean(navigation))}>
      <header className={plain ? headerPlain : header}>
        {backButton}
        {plain ? null : <span className={wordmark}>YAPP+</span>}
      </header>
      {children}
      {navigation}
    </div>
  );
}
