import { ErrorState } from '@/shared/ui/error-state';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

const renderScheduleError = (props: FallbackProps) => <ScheduleErrorFallback {...props} />;

export function ScheduleErrorBoundary({ children }: { children: ReactNode }) {
  return <LocalErrorBoundary fallbackRender={renderScheduleError}>{children}</LocalErrorBoundary>;
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
