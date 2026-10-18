/** 세션 쿼리 키와 조회 옵션을 함께 관리하고 개발 환경의 브라우저에서만 조회를 활성화합니다. */
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { createSession, listSessions } from './sessions';

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

/** 생성 옵션과 성공 후 목록 무효화를 같은 팩토리에서 관리합니다. */
export const sessionMutations = {
  create: (client: QueryClient) =>
    mutationOptions({
      mutationKey: [...sessionQueries.all(), 'create'],
      mutationFn: createSession,
      onSuccess: () => client.invalidateQueries({ queryKey: sessionQueries.list().queryKey }),
    }),
};

export function useCreateSessionMutation() {
  const client = useQueryClient();
  return useMutation(sessionMutations.create(client));
}
