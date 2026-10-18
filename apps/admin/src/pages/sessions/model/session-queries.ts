/** 세션 쿼리 키와 조회 옵션을 함께 관리하고 개발 환경의 브라우저에서만 조회를 활성화합니다. */
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { listSessions } from './sessions';

export const sessionQueries = {
  all: () => ['admin', 'sessions'] as const,
  list: () =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'list'],
      queryFn: listSessions,
      retry: false,
    }),
};

export function useSessionsQuery() {
  const hydrated = useHydrated();

  return useQuery({
    ...sessionQueries.list(),
    enabled: import.meta.env.DEV && hydrated,
  });
}
