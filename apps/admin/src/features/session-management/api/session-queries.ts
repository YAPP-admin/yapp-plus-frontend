import { queryOptions } from '@tanstack/react-query';
import { find1QueryKey, type CreateSessionRequest, type Find1Data } from '@yapp-plus/api/generated';
import { createSession, deleteSession, listSessions, updateSession } from './session-api';

type AllSessionsOptions = Pick<Find1Data, 'path' | 'query'>;

function allSessionsOptions(generationId: number): AllSessionsOptions {
  return {
    path: { generationId },
    query: { type: 'ALL' },
  };
}

/** 생성 SDK와 동일한 경로·유형을 사용하는 세션 목록 query key다. */
export function sessionsQueryKey(generationId: number) {
  return find1QueryKey(allSessionsOptions(generationId));
}

/** 기수 ID를 query key와 API 호출 양쪽에 명시적으로 포함한다. */
export function sessionsQueryOptions(generationId: number) {
  return queryOptions({
    queryKey: sessionsQueryKey(generationId),
    queryFn: ({ signal }) => listSessions(generationId, signal),
    retry: false,
  });
}

/** 세션 생성 Mutation 옵션. 성공 후 목록 갱신은 소비자가 담당한다. */
export function createSessionMutationOptions(generationId: number) {
  return {
    mutationKey: ['admin', 'generations', generationId, 'sessions', 'create'] as const,
    mutationFn: (body: CreateSessionRequest) => createSession(generationId, body),
    retry: false,
  };
}

/** 세션 수정 Mutation 옵션. 기수·세션 ID를 옵션 생성 시점에 명시한다. */
export function updateSessionMutationOptions(generationId: number, sessionId: number) {
  return {
    mutationKey: ['admin', 'generations', generationId, 'sessions', sessionId, 'update'] as const,
    mutationFn: (body: CreateSessionRequest) => updateSession(generationId, sessionId, body),
    retry: false,
  };
}

/** 세션 삭제 Mutation 옵션. 기수·세션 ID를 옵션 생성 시점에 명시한다. */
export function deleteSessionMutationOptions(generationId: number, sessionId: number) {
  return {
    mutationKey: ['admin', 'generations', generationId, 'sessions', sessionId, 'delete'] as const,
    mutationFn: () => deleteSession(generationId, sessionId),
    retry: false,
  };
}
