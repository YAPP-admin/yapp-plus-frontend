import { historyInfiniteOptions } from '@yapp-plus/api/generated';

export function notificationHistoryQueryOptions() {
  const options = historyInfiniteOptions();
  return {
    ...options,
    getNextPageParam: (lastPage: { nextCursor: string | null }) => lastPage.nextCursor ?? undefined,
  };
}
