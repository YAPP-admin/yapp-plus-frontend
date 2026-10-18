/** 앱 루트에서 Query 캐시와 SEED Snackbar 컨텍스트·표시 영역을 제공합니다. */
import { Snackbar } from '@seed-design/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

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

  return (
    <QueryClientProvider client={queryClient}>
      <Snackbar.RootProvider>
        {children}
        <Snackbar.Region data-seed-color-mode="dark-only">
          <Snackbar.Renderer />
        </Snackbar.Region>
      </Snackbar.RootProvider>
    </QueryClientProvider>
  );
}
