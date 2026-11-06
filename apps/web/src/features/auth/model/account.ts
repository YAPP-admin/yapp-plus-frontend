import type { QueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';

const identities = new WeakMap<QueryClient, string | null>();

/** 확정한 계정 경계에서 업무 cache를 정리합니다. 토큰 갱신·조회 실패는 경계가 아닙니다. */
export function applyAccountBoundary(client: QueryClient, result: AuthResult): void {
  if (
    result.status !== 'SIGNED_IN' &&
    result.status !== 'SIGNED_OUT' &&
    result.status !== 'WITHDRAWN'
  ) {
    return;
  }

  const identity =
    result.status === 'SIGNED_IN'
      ? JSON.stringify([result.session.userId, result.session.sessionId])
      : null;
  if (identities.get(client) === identity) {
    return;
  }
  identities.set(client, identity);

  // 현재 계정과 무관하게 유지할 업무 query는 없습니다. 인증 query는 별도로 반영합니다.
  const businessQueries = {
    predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey[0] !== 'native-auth',
  };
  void client.cancelQueries(businessQueries);
  client.removeQueries(businessQueries);

  // cache 제거는 서버 mutation 취소가 아닙니다. 진행 중 인증은 자신의 lifecycle을 마칩니다.
  const mutations = client.getMutationCache();
  for (const mutation of mutations.getAll()) {
    if (
      mutation.options.mutationKey?.[0] !== 'native-auth' ||
      mutation.state.status !== 'pending'
    ) {
      mutations.remove(mutation);
    }
  }
}
