/** Provider 바깥 최종 오류 경계다. 앱 의존성 없이 새로고침과 홈 복구만 제공한다. */
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorState } from '@/shared/ui/error-state';

function reloadPage() {
  window.location.reload();
}

function AppErrorFallback() {
  return (
    <ErrorState
      variant="page"
      titleAs="h1"
      onRetry={reloadPage}
      retryLabel="새로고침"
      secondaryAction={{ label: '홈으로 이동', href: '/' }}
    />
  );
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={AppErrorFallback}>{children}</ErrorBoundary>;
}
