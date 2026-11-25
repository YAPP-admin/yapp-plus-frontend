/** 홈 공지 조회 실패를 세션·출석 영역과 분리해 재시도시키는 오류 경계다. */
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/** query 오류를 초기 오류 화면으로 변환하고 재시도 시 TanStack Query 오류 상태를 초기화한다. */
export function WeeklyNoticesErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ScreenQueryBoundary renderFallback={(props) => <WeeklyNoticesError {...props} />}>
      {children}
    </ScreenQueryBoundary>
  );
}

function WeeklyNoticesError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="section"
      title="이번 주 공지를 불러오지 못했어요"
      titleAs="h3"
      onRetry={resetErrorBoundary}
    />
  );
}
