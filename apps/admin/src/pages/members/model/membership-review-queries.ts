/** 가입 심사 화면에서 사용하는 생성 SDK Query 옵션을 한곳에서 조합합니다. */
import {
  findCandidatesOptions,
  findDetailOptions,
  findPendingInfiniteOptions,
  type FindPendingResponse,
} from '@yapp-plus/api/generated';

const PENDING_PAGE_SIZE = 20;

export function pendingMembershipsQueryOptions() {
  const generated = findPendingInfiniteOptions({
    query: { reviewStatus: 'PENDING', size: PENDING_PAGE_SIZE },
  });

  return {
    ...generated,
    initialPageParam: {},
    getNextPageParam: (lastPage: FindPendingResponse) => lastPage.nextCursor ?? undefined,
  };
}

export function membershipDetailQueryOptions(memberId: number) {
  return findDetailOptions({ path: { memberId } });
}

export function rosterCandidatesQueryOptions(memberId: number, generationId: number) {
  return findCandidatesOptions({ path: { memberId }, query: { generationId } });
}
