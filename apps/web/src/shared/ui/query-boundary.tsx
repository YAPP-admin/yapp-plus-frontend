import { Suspense, type ReactNode } from 'react';
import { LocalErrorBoundary } from './local-error-boundary';

export function QueryBoundary({
  children,
  pendingFallback,
  errorFallback,
}: {
  children: ReactNode;
  pendingFallback: ReactNode;
  errorFallback: ReactNode;
}) {
  return (
    <LocalErrorBoundary fallback={errorFallback}>
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </LocalErrorBoundary>
  );
}
