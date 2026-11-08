/** 공지 상세 초기 조회 실패를 해당 화면 안에서 재시도 가능하게 처리한다. */
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { ResultSection } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { container } from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';

/** query 오류 상태를 재설정하고 상세 조회 오류 안내를 표시한다. */
export function NoticeDetailErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ScreenQueryBoundary renderFallback={(props) => <NoticeDetailError {...props} />}>
      {children}
    </ScreenQueryBoundary>
  );
}

function NoticeDetailError({ resetErrorBoundary }: FallbackProps) {
  return (
    <>
      <NoticeDetailHeader categoryLabel="공지사항" />
      <main className={container}>
        <ResultSection
          role="alert"
          size="medium"
          title="공지 상세를 불러오지 못했어요"
          primaryActionProps={{ children: '다시 시도', onClick: resetErrorBoundary }}
        />
      </main>
    </>
  );
}
