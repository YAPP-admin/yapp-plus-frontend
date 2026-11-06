'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installSafeAreaBridge } from '@yapp-plus/app-bridge/web';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { MockApiBoundary } from '../mocks/mock-api-boundary';

/** 앱과 Stackflow 가드가 동일한 인증 cache를 읽도록 client를 공유합니다. */
export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });

export function Providers({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [queryClient] = useState(() => client ?? createAppQueryClient());

  useEffect(() => installSafeAreaBridge(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <MockApiBoundary>
        <SnackbarProvider>{children}</SnackbarProvider>
      </MockApiBoundary>
    </QueryClientProvider>
  );
}
