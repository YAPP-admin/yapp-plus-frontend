import { ErrorState } from '@/shared/ui/error-state';
import { useErrorBoundary } from 'react-error-boundary';

export function AttendanceQueryError({
  message,
  retryLabel,
}: {
  message: string;
  retryLabel: string;
}) {
  const { resetBoundary } = useErrorBoundary();
  return (
    <ErrorState
      variant="section"
      title={message}
      titleAs="h2"
      onRetry={resetBoundary}
      retryLabel={retryLabel}
    />
  );
}
