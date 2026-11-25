/** 공지 목록의 초기 조회 오류를 탭 페이지 안에서 복구하는 UI 경계다. */
import { ErrorState } from '@/shared/ui/error-state';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

const renderNoticeListError = (props: FallbackProps) => <NoticeListError {...props} />;

/** 공지 목록의 초기 조회 실패를 목록 내부에서 재시도 가능한 결과 화면으로 한정한다. */
export function NoticeListBoundary({ children }: { children: ReactNode }) {
  return <LocalErrorBoundary fallbackRender={renderNoticeListError}>{children}</LocalErrorBoundary>;
}

function NoticeListError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="page"
      title="공지사항을 불러오지 못했어요"
      titleAs="h2"
      onRetry={resetErrorBoundary}
    />
  );
}
