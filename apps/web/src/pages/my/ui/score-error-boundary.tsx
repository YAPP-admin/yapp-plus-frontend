/** 출석 현황의 오류를 격리하고 재시도는 기존 Query 오류 경계에 맡깁니다. */
import { Box } from '@seed-design/react';
import { ErrorState } from '@/shared/ui/error-state';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

/** 출석 카드의 오류·재시도가 다른 마이페이지 영역을 교체하지 않게 합니다. */
export function ScoreErrorBoundary({ children }: { children: ReactNode }) {
  return <LocalErrorBoundary fallbackRender={ScoreError}>{children}</LocalErrorBoundary>;
}

function ScoreError({ resetErrorBoundary }: FallbackProps) {
  return (
    <Box gridColumn="1 / -1" gridRow="2" p="x4">
      <ErrorState
        variant="section"
        title="출석 현황을 불러오지 못했어요"
        titleAs="h2"
        onRetry={resetErrorBoundary}
      />
    </Box>
  );
}
