import { VStack } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
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
    <VStack gap="x2" role="alert">
      <p>{message}</p>
      <ActionButton size="small" variant="neutralWeak" onClick={resetBoundary}>
        {retryLabel}
      </ActionButton>
    </VStack>
  );
}
