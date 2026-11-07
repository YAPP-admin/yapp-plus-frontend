import { QueryClient } from '@tanstack/react-query';
import {
  list1InfiniteQueryKey,
  list1QueryKey,
  type UserPostListResponse,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import {
  memberNoticeListInfiniteQueryOptions,
  memberNoticeListQueryOptions,
  noticeListSchema,
} from './notice-queries';

const notice = {
  postId: 1,
  type: 'SESSION',
  title: '공지',
  createdDate: '2026-11-07',
  daysUntilDeadline: null,
} as const;
const page = (nextCursor: string | null = null): UserPostListResponse => ({
  totalPostCount: 1,
  items: [notice],
  nextCursor,
});
const url = `${apiBaseUrl}/api/posts`;

it('생성 single/infinite key, 유형과 첫 페이지 cursor 생략을 유지한다', async () => {
  server.use(
    http.get(url, ({ request }) => {
      const search = new URL(request.url).searchParams;
      expect(search.get('type')).toBe('ASSIGNMENT');
      expect(search.has('cursor')).toBe(false);
      return HttpResponse.json(page());
    }),
  );
  const options = memberNoticeListQueryOptions('ASSIGNMENT');
  expect(options.queryKey).toEqual(list1QueryKey({ query: { type: 'ASSIGNMENT' } }));
  await expect(new QueryClient().fetchQuery(options)).resolves.toMatchObject({
    totalPostCount: 1,
    items: [{ postId: 1 }],
  });
  expect(memberNoticeListInfiniteQueryOptions('ASSIGNMENT').queryKey).toEqual(
    list1InfiniteQueryKey({ query: { type: 'ASSIGNMENT' } }),
  );
});

it.each([
  { totalPostCount: -1 },
  { nextCursor: '' },
  { items: [{ ...notice, postId: '9007199254740993' }] },
  { items: [{ ...notice, postId: 0 }] },
  { items: [{ ...notice, createdDate: '2026-02-29' }] },
])('잘못된 목록 응답을 거부한다: %j', (change) => {
  expect(noticeListSchema.safeParse({ ...page(), ...change }).success).toBe(false);
});

it('마감 일수·총 개수를 안전한 number로 변환하고 null 커서에서 추가 조회를 끝낸다', async () => {
  const response = await noticeListSchema.parseAsync({
    totalPostCount: '2',
    items: [{ ...notice, postId: '2', daysUntilDeadline: '-1' }],
    nextCursor: null,
  });
  expect(response).toEqual({
    totalPostCount: 2,
    items: [{ ...notice, postId: 2, daysUntilDeadline: -1 }],
    nextCursor: null,
  });
  expect(memberNoticeListInfiniteQueryOptions().getNextPageParam(page())).toBeUndefined();
});
