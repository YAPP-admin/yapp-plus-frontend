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
