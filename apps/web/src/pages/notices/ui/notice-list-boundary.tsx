/** 공지 목록의 초기 조회 오류를 탭 페이지 안에서 복구하는 UI 경계다. */
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ResultSection } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

/** 공지 목록의 초기 조회 실패를 목록 내부에서 재시도 가능한 결과 화면으로 한정한다. */
export function NoticeListBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={NoticeListError}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function NoticeListError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ResultSection
      role="alert"
      size="medium"
      title="공지사항을 불러오지 못했어요"
      primaryActionProps={{ children: '다시 시도', onClick: resetErrorBoundary }}
    />
  );
}
