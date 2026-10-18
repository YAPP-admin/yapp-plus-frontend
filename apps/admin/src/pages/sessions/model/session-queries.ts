/** 세션 목록 Query를 정의하고 개발 환경의 브라우저에서만 조회를 활성화합니다. */
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { listSessions } from './sessions';

export const sessionsQueryOptions = queryOptions({
  queryKey: ['admin', 'sessions'],
  queryFn: listSessions,
  retry: false,
});

export function useSessionsQuery() {
  const hydrated = useHydrated();

  return useQuery({
    ...sessionsQueryOptions,
    enabled: import.meta.env.DEV && hydrated,
  });
}
