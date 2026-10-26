/** 어드민 QueryClient와 주소 검색의 명시적 조회 정책을 구성합니다. */
import { QueryClient } from '@tanstack/react-query';

export function createAdminQueryClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
  client.setQueryDefaults(['admin', 'address-search'], {
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: 0,
  });
  return client;
}
