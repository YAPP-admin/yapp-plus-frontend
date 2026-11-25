/** 공지 상세 초기 조회 실패를 해당 화면 안에서 재시도 가능하게 처리한다. */
import { ErrorState } from '@/shared/ui/error-state';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { container } from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';

const renderNoticeDetailError = (props: FallbackProps) => <NoticeDetailError {...props} />;

/** query 오류 상태를 재설정하고 상세 조회 오류 안내를 표시한다. */
export function NoticeDetailErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <LocalErrorBoundary fallbackRender={renderNoticeDetailError}>{children}</LocalErrorBoundary>
  );
}

function NoticeDetailError({ resetErrorBoundary }: FallbackProps) {
  return (
    <>
      <NoticeDetailHeader categoryLabel="공지사항" />
      <main className={container}>
        <ErrorState
          variant="page"
          title="공지 상세를 불러오지 못했어요"
          onRetry={resetErrorBoundary}
        />
      </main>
    </>
  );
}
