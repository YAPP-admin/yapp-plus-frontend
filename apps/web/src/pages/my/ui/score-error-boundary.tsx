import { Box } from '@seed-design/react';
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function ScoreErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ScreenQueryBoundary renderFallback={(props) => <ScoreError {...props} />}>
      {children}
    </ScreenQueryBoundary>
  );
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
