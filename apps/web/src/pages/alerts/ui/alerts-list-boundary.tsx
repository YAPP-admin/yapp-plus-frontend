import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { ResultSection } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/** 알림함의 초기 조회 오류를 목록 내부에서 재시도 가능한 결과 화면으로 한정한다. */
export function AlertsListBoundary({ children }: { children: ReactNode }) {
  return (
    <ScreenQueryBoundary renderFallback={(props) => <AlertsListError {...props} />}>
      {children}
    </ScreenQueryBoundary>
  );
}

function AlertsListError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ResultSection
      role="alert"
      size="medium"
      title="알림을 불러오지 못했어요"
      primaryActionProps={{ children: '다시 시도', onClick: resetErrorBoundary }}
    />
  );
}
