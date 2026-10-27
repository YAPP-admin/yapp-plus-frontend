import type { ReactNode } from 'react';
import {
  customHeaderContainer,
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

function getHeaderClassName(
  customHeader: ReactNode | undefined,
  plain: boolean,
  borderlessHeader: boolean,
) {
  if (customHeader) {
    return customHeaderContainer;
  }
  if (plain || borderlessHeader) {
    return headerPlain;
  }
  return header;
}

export function PageShell({
  children,
  navigation,
  backButton,
  plain = false,
  borderlessHeader = false,
  header: customHeader,
}: {
  children: ReactNode;
  navigation?: ReactNode;
  backButton?: ReactNode;
  /** 인증 화면용입니다. YAPP+ 문구와 구분선을 숨기고 흰색 배경을 사용합니다. */
  plain?: boolean;
  /** 헤더 구분선을 숨깁니다. */
  borderlessHeader?: boolean;
  /** 커스텀 헤더입니다. null을 전달하면 헤더 영역을 숨깁니다. */
  header?: ReactNode;
}) {
  const headerClassName = getHeaderClassName(customHeader, plain, borderlessHeader);

  return (
    <div className={getShellClassName(plain, Boolean(navigation))}>
      {customHeader !== null && (
        <header className={headerClassName}>
          {customHeader ?? (
            <>
              {backButton}
              {plain ? null : <span className={wordmark}>YAPP+</span>}
            </>
          )}
        </header>
      )}
      {children}
      {navigation}
    </div>
  );
}
