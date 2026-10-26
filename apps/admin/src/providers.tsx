import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { MockApiBoundary } from './mocks/mock-api-boundary';
import { createAdminQueryClient } from './query-client';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAdminQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <MockApiBoundary>{children}</MockApiBoundary>
    </QueryClientProvider>
  );
}
