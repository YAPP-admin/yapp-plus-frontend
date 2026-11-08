import { Suspense, type ReactNode } from 'react';
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
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
    <ScreenQueryBoundary
      renderFallback={() => <AttendanceQueryError message={message} retryLabel={retryLabel} />}
    >
      <Suspense fallback={loading}>{children}</Suspense>
    </ScreenQueryBoundary>
  );
}
