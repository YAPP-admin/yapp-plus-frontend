'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installSafeAreaBridge } from '@yapp-plus/app-bridge/web';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useState, type ReactNode } from 'react';
import {
  handleQueryAuthenticationError,
  isAuthenticationError,
  isNativeWebView,
} from '@/features/auth';
import { ErrorBoundaryPolicyProvider } from '@/shared/ui/error-boundary-policy';
import { MockApiBoundary } from '../mocks/mock-api-boundary';

/** 앱과 Stackflow 가드가 동일한 인증 cache를 읽도록 client를 공유합니다. */
export const createAppQueryClient = () => {
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        handleQueryAuthenticationError(client, error);
      },
    }),
    defaultOptions: { queries: { staleTime: 30_000, retry: false } },
  });
  return client;
};

export function Providers({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [queryClient] = useState(() => client ?? createAppQueryClient());

  useEffect(() => installSafeAreaBridge(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundaryPolicyProvider
        policy={{
          shouldRethrow: (error) => isNativeWebView() && isAuthenticationError(error),
        }}
      >
        <MockApiBoundary>
          <SnackbarProvider>{children}</SnackbarProvider>
        </MockApiBoundary>
      </ErrorBoundaryPolicyProvider>
    </QueryClientProvider>
  );
}
