import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import type { CreateSessionInput } from './session';
import { createSession, listSessions, updateSession } from './sessions';

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

/** 생성 결과가 목록과 개수에 반영될 때까지 저장 완료를 기다립니다. */
export function useCreateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => client.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
  });
}

/** 수정 후에도 현재 필터를 유지하며 목록·정렬·개수를 다시 조회합니다. */
export function useUpdateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSessionInput }) =>
      updateSession(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
  });
}
