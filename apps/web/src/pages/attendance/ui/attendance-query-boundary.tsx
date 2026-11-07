import { Suspense, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
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
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={<AttendanceQueryError message={message} retryLabel={retryLabel} />}
        >
          <Suspense fallback={loading}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
