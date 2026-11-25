'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installSafeAreaBridge } from '@yapp-plus/app-bridge/web';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useState, type ReactNode } from 'react';
import {
  handleQueryAuthenticationError,
  handleMutationAuthenticationError,
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
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // native 인증 작업은 AuthResult를 직접 처리하므로 업무 Mutation 정책에서 제외합니다.
        if (!mutation.options.meta?.authOperation) {
          handleMutationAuthenticationError(client, error);
        }
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: false },
      // 일반 실패는 각 Mutation의 입력·롤백 UI가 처리하고 최종 인증 실패만 상위로 전파합니다.
      mutations: {
        throwOnError: (error) => isNativeWebView() && isAuthenticationError(error),
      },
    },
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
