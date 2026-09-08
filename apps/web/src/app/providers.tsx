'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installSafeAreaBridge } from '@yapp-plus/app-bridge/web';
import { useEffect, useState, type ReactNode } from 'react';

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
