/** 알림 목록 조회와 푸시 수신에 따른 캐시 무효화 정책을 정의합니다. */
import type { QueryClient } from '@tanstack/react-query';
import { find3InfiniteOptions, type UserNotificationListResponse } from '@yapp-plus/api/generated';

/** 생성된 알림 목록 cursor query에 첫 페이지 cursor 생략을 명시한다. */
export function alertsInfiniteQueryOptions(options?: Parameters<typeof find3InfiniteOptions>[0]) {
  const generated = find3InfiniteOptions(options);
  return {
    ...generated,
    // 생성 타입에는 skipToken도 포함되지만 Suspense는 함수만 허용한다.
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    initialPageParam: {},
    getNextPageParam: (lastPage: UserNotificationListResponse) => lastPage.nextCursor ?? undefined,
  };
}

/** 숨겨진 목록은 stale만 표시하고 화면 복귀 시 기존 재조회 훅이 갱신합니다. */
export function invalidateAlertsForPush(client: QueryClient, isAlertsActive: boolean) {
  return client.invalidateQueries({
    queryKey: alertsInfiniteQueryOptions().queryKey,
    refetchType: isAlertsActive ? 'active' : 'none',
  });
}
