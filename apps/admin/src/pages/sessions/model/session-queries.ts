import {
  queryOptions,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import type { CreateSessionInput, Session } from './session';
import { createSession, listSessions, updateSession } from './sessions';

export const sessionsQueryOptions = queryOptions({
  queryKey: ['admin', 'sessions'],
  queryFn: async () => ({ sessions: await listSessions(), complete: true }),
  retry: false,
});

export function useSessionsQuery() {
  const hydrated = useHydrated();

  return useQuery({
    ...sessionsQueryOptions,
    enabled: hydrated,
  });
}

/** 저장 성공 응답은 확정된 결과이며, 이전 조회와 후속 조회 실패로 되돌리지 않습니다. */
async function reflectSavedSession(client: QueryClient, saved: Session) {
  const queryKey = sessionsQueryOptions.queryKey;
  await client.cancelQueries({ queryKey });
  client.setQueryData(queryKey, (previous) => ({
    sessions: [...(previous?.sessions ?? []).filter((session) => session.id !== saved.id), saved],
    complete: previous?.complete ?? false,
  }));
  await client.invalidateQueries({ queryKey, refetchType: 'all' });
}

/** 생성 결과가 목록과 개수에 반영될 때까지 저장 완료를 기다립니다. */
export function useCreateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (saved) => reflectSavedSession(client, saved),
  });
}

/** 수정 후에도 현재 필터를 유지하며 목록·정렬·개수를 다시 조회합니다. */
export function useUpdateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSessionInput }) =>
      updateSession(id, input),
    onSuccess: (saved) => reflectSavedSession(client, saved),
  });
}
