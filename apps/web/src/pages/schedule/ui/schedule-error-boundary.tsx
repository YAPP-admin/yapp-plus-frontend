import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function ScheduleErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ScreenQueryBoundary renderFallback={(props) => <ScheduleErrorFallback {...props} />}>
      {children}
    </ScreenQueryBoundary>
  );
}

function ScheduleErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="page"
      title="일정을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      onRetry={resetErrorBoundary}
    />
  );
}
