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
    enabled: hydrated,
  });
}
