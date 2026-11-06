import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';

export type AccountDestination = 'current' | 'home' | 'login' | 'signup-complete';
type AccountScope = {
  identity: string | null | undefined;
  revision: number;
  destination: AccountDestination;
};
const initialScope: AccountScope = { identity: undefined, revision: 0, destination: 'current' };

/** 확정한 계정 경계를 데이터 정리와 화면 수명이 함께 사용합니다. */
export const accountScopeOptions = queryOptions({
  queryKey: ['native-auth', 'account-scope'],
  queryFn: () => initialScope,
  initialData: initialScope,
  enabled: false,
  staleTime: Number.POSITIVE_INFINITY,
});

/** 확정한 계정 경계에서 업무 cache를 정리합니다. 토큰 갱신·조회 실패는 경계가 아닙니다. */
export function applyAccountBoundary(
  client: QueryClient,
  result: AuthResult,
  signup = false,
): void {
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
  const previous = client.getQueryData(accountScopeOptions.queryKey) ?? initialScope;
  if (previous.identity === identity) {
    return;
  }

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
  const changed = previous.identity !== undefined;
  let destination: AccountDestination = 'current';
  if (changed) {
    if (identity === null) {
      destination = 'login';
    } else {
      destination = signup ? 'signup-complete' : 'home';
    }
  }
  client.setQueryData(accountScopeOptions.queryKey, {
    identity,
    revision: previous.revision + Number(changed),
    destination,
  });
}
