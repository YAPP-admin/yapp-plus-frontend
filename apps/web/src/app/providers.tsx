'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installSafeAreaBridge } from '@yapp-plus/app-bridge/web';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { MockApiBoundary } from '../mocks/mock-api-boundary';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      }),
  );

  useEffect(() => installSafeAreaBridge(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <MockApiBoundary>
        <SnackbarProvider>{children}</SnackbarProvider>
      </MockApiBoundary>
    </QueryClientProvider>
  );
}
