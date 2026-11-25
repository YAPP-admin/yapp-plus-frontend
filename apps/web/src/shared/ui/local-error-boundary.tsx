/** Query reset을 묶되, 상위가 소유한 오류는 다시 던진다. */
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useErrorBoundaryPolicy } from './error-boundary-policy';

export function LocalErrorBoundary({
  children,
  fallback,
  fallbackRender,
  resetKeys,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: FallbackProps) => ReactNode;
  resetKeys?: unknown[];
}) {
  const { shouldRethrow } = useErrorBoundaryPolicy();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={resetKeys}
          fallbackRender={(props) => {
            if (shouldRethrow(props.error)) {
              throw props.error;
            }
            return fallbackRender?.(props) ?? fallback ?? null;
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
