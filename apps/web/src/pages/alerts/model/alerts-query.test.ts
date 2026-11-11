import { InfiniteQueryObserver } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { find3InfiniteQueryKey, type UserNotificationListResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { alertSentDateLabel } from './alerts-display';
import { alertsInfiniteQueryOptions } from './alerts-query';

const url = `${apiBaseUrl}/api/users/me/notifications`;
const item = {
  id: 1,
  content: '새 공지가 올라왔어요.',
  sentDate: '2026-11-07',
  type: 'POST',
  postId: 4,
} as const;
const page = (id = 1, nextCursor: string | null = null): UserNotificationListResponse => ({
  items: [{ ...item, id }],
  nextCursor,
});

describe('alertsInfiniteQueryOptions', () => {
  it('생성 key·첫 cursor 생략·날짜 표시를 유지한다', async () => {
    server.use(
      http.get(url, ({ request }) => {
        expect(new URL(request.url).searchParams.has('cursor')).toBe(false);
        return HttpResponse.json(page(42));
      }),
    );
    expect(alertsInfiniteQueryOptions().queryKey).toEqual(find3InfiniteQueryKey());
    const data = await createAppQueryClient().fetchInfiniteQuery(alertsInfiniteQueryOptions());
    expect(data.pages[0]?.items[0]?.id).toBe(42);
    expect(alertSentDateLabel('2026-11-07')).toBe('11월 7일');
  });

  it('서버의 다음 cursor로 다음 페이지를 조회하고 null에서 끝낸다', async () => {
    server.use(
      http.get(url, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(cursor === null ? page(1, 'next') : page(2));
      }),
    );
    const observer = new InfiniteQueryObserver(
      createAppQueryClient(),
      alertsInfiniteQueryOptions(),
    );
    await observer.refetch();
    await observer.fetchNextPage();
    const result = observer.getCurrentResult();
    expect(result.hasNextPage).toBe(false);
    expect(
      result.data?.pages.flatMap((resultPage) => resultPage.items).map(({ id }) => id),
    ).toEqual([1, 2]);
  });

  it.each([401, 503])('%i 재조회 오류에도 마지막 성공 목록을 보존한다', async (status) => {
    let shouldFail = false;
    server.use(
      http.get(url, () =>
        shouldFail ? HttpResponse.json({ code: 'ERROR' }, { status }) : HttpResponse.json(page(1)),
      ),
    );
    const observer = new InfiniteQueryObserver(
      createAppQueryClient(),
      alertsInfiniteQueryOptions(),
    );
    await observer.refetch();
    shouldFail = true;
    await observer.refetch();

    const result = observer.getCurrentResult();
    expect(result.error).not.toBeNull();
    expect(result.data?.pages[0]?.items[0]).toMatchObject({ id: 1 });
  });
});
