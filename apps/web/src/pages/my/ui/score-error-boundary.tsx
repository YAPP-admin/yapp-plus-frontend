import { VStack } from '@seed-design/react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ActionButton } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ScoreSummary } from './score-summary';
import { queryNotice } from './my-page.css';

export function ScoreErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ScoreError}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function ScoreError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ScoreSummary
      notice={
        <VStack
          gridColumn="1 / -1"
          align="flex-start"
          gap="x2"
          p="x4"
          className={queryNotice}
          role="alert"
        >
          <p>출석 현황을 불러오지 못했어요.</p>
          <ActionButton
            type="button"
            variant="neutralWeak"
            size="small"
            onClick={resetErrorBoundary}
          >
            다시 시도
          </ActionButton>
        </VStack>
      }
    />
  );
}
