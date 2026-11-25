import { Suspense, type ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import { AttendanceQueryError } from './attendance-query-error';

export function AttendanceQueryBoundary({
  children,
  message,
  retryLabel = '다시 시도',
  loading = null,
}: {
  children: ReactNode;
  message: string;
  retryLabel?: string;
  loading?: ReactNode;
}) {
  return (
    <AttendanceFallbackBoundary
      renderFallback={() => <AttendanceQueryError message={message} retryLabel={retryLabel} />}
    >
      <Suspense fallback={loading}>{children}</Suspense>
    </AttendanceFallbackBoundary>
  );
}

/** 출석 fallback은 경계 context에서 reset을 읽으므로 화면 내부 어댑터가 경계를 직접 소유합니다. */
function AttendanceFallbackBoundary({
  children,
  renderFallback,
}: {
  children: ReactNode;
  renderFallback: (props: FallbackProps) => ReactNode;
}) {
  return <LocalErrorBoundary fallbackRender={renderFallback}>{children}</LocalErrorBoundary>;
}
