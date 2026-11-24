import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { list5InfiniteOptions } from '@yapp-plus/api/generated';

type UseMemberImportRosterQueryOptions = {
  generationId: number;
  enabled: boolean;
};

/** 현재 기수의 사전 명단을 생성 SDK의 커서 옵션으로 마지막 페이지까지 조회한다. */
export function useMemberImportRosterQuery({
  generationId,
  enabled,
}: UseMemberImportRosterQueryOptions) {
  const query = useInfiniteQuery({
    ...list5InfiniteOptions({ path: { generationId } }),
    enabled,
    initialPageParam: { path: { generationId } },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (enabled && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    ...query,
    rosterEntries: query.data?.pages.flatMap((page) => page.items) ?? [],
    isFetchingAllPages: enabled && (query.isPending || query.isFetching || query.hasNextPage),
  };
}
