import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ResultSection } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import {
  errorContainer,
  errorTitle,
  result,
  graphic,
  description,
} from './schedule-error-boundary.css';

export function ScheduleErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ScheduleErrorFallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function ScheduleErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className={errorContainer}>
      <h2 className={errorTitle}>앗! 오류가 발생했어요</h2>
      <ResultSection
        className={result}
        size="medium"
        asset={
          <img
            className={graphic}
            src="/images/schedule/graphic-error.png"
            width={231.159}
            height={166.006}
            alt=""
          />
        }
        description={
          <span className={description}>
            예상하지 못한 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </span>
        }
        primaryActionProps={{
          children: '다시 시도',
          onClick: resetErrorBoundary,
        }}
      />
    </div>
  );
}
