import { InfiniteQueryObserver } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { find5InfiniteQueryKey, type AttendanceHistoryResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { historyQueryOptions } from './history-query';

const page = (id = 1, nextCursor: string | null = null): AttendanceHistoryResponse => ({
  summary: { totalSessionCount: 12, startedSessionCount: 7 },
  items: [
    {
      sessionId: id,
      sessionName: `세션 ${id}`,
      attendanceStatus: 'PRESENT',
      staffDecisionStatus: null,
    },
  ],
  nextCursor,
});
const url = `${apiBaseUrl}/api/attendance-history`;
it.each([
  { summary: { totalSessionCount: -1, startedSessionCount: 0 } },
  { summary: { totalSessionCount: 1, startedSessionCount: 2 } },
  { nextCursor: '' },
  { items: [{ ...page().items[0], sessionId: '9007199254740993' }] },
  { items: [{ ...page().items[0], attendanceStatus: 'UNKNOWN' }] },
])('잘못된 응답을 실패로 처리한다: %j', async (change) => {
  server.use(http.get(url, () => HttpResponse.json({ ...page(), ...change })));
  await expect(createAppQueryClient().fetchInfiniteQuery(historyQueryOptions())).rejects.toThrow(
    /./,
  );
});
it('생성 key·cursor 생략·안전한 ID 변환을 유지한다', async () => {
  server.use(
    http.get(url, ({ request }) => {
      expect(new URL(request.url).searchParams.has('cursor')).toBe(false);
      return HttpResponse.json({ ...page(), items: [{ ...page().items[0], sessionId: '42' }] });
    }),
  );
  expect(historyQueryOptions().queryKey).toEqual(find5InfiniteQueryKey());
  const data = await createAppQueryClient().fetchInfiniteQuery(historyQueryOptions());
  expect(data.pages[0]?.items[0]?.sessionId).toBe(42);
});
it('서버의 다음 커서로 3페이지 조회·전체 재조회하고 null에서 종료한다', async () => {
  server.use(
    http.get(url, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      if (cursor === null) {
        return HttpResponse.json(page(1, 'A'));
      }
      if (cursor === 'A') {
        return HttpResponse.json(page(2, 'B'));
      }
      return HttpResponse.json({
        ...page(3),
        summary: { totalSessionCount: 13, startedSessionCount: 8 },
      });
    }),
  );
  const observer = new InfiniteQueryObserver(createAppQueryClient(), historyQueryOptions());
  await observer.refetch();
  await observer.fetchNextPage();
  await observer.fetchNextPage();
  const result = await observer.refetch();
  expect(result.error).toBeNull();
  expect(observer.getCurrentResult().hasNextPage).toBe(false);
  expect(result.data?.pages).toHaveLength(3);
  expect(
    result.data?.pages.flatMap((resultPage) => resultPage.items).map((item) => item.sessionId),
  ).toEqual([1, 2, 3]);
  expect(result.data?.pages.at(-1)?.summary).toEqual({
    totalSessionCount: 13,
    startedSessionCount: 8,
  });
});
