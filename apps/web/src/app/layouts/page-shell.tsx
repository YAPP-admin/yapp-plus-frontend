/** 화면별 헤더·본문·하단 탐색의 의미와 기본 배치를 제공합니다. */
import { Flex, Grid, Text } from '@seed-design/react';
import type { ReactNode } from 'react';
import {
  customHeaderContainer,
  header,
  headerPlain,
  shell,
  shellWithNavigation,
  wordmark,
} from './page-shell.css';

function getShellClassName(plain: boolean, hasNavigation: boolean) {
  if (plain) {
    return shell;
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
  className,
  navigation,
  backButton,
  plain = false,
  borderlessHeader = false,
  header: customHeader,
}: {
  children: ReactNode;
  /** 화면별 높이·스크롤 배치를 조정합니다. */
  className?: string;
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
  let rows = 'auto 1fr';
  if (navigation && !plain) {
    rows = 'auto 1fr auto';
  } else if (customHeader === null) {
    rows = '1fr';
  }

  return (
    <Grid
      rows={rows}
      bg="bg.layerDefault"
      className={[getShellClassName(plain, Boolean(navigation)), className]
        .filter(Boolean)
        .join(' ')}
    >
      {customHeader !== null && (
        <Flex
          as="header"
          direction={customHeader ? 'column' : 'row'}
          align={customHeader ? undefined : 'center'}
          gap={customHeader ? undefined : 'x3'}
          className={headerClassName}
        >
          {customHeader ?? (
            <>
              {backButton}
              {plain ? null : (
                <Text textStyle="t3Bold" className={wordmark}>
                  YAPP+
                </Text>
              )}
            </>
          )}
        </Flex>
      )}
      {children}
      {navigation}
    </Grid>
  );
}
