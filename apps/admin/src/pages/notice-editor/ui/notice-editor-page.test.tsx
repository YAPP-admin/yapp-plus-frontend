import { expect, it } from 'vitest';
import {
  adminNoticeListQueryOptions,
  adminNoticeRecipientsQueryOptions,
} from '~/features/notice-management';

it('공지 목록 종류 필터를 생성 SDK cursor 옵션으로 전달한다', () => {
  const options = adminNoticeListQueryOptions(25, 'submission');
  const key = options.queryKey[0];

  expect(key.path).toEqual({ generationId: 25 });
  expect(key.query).toEqual({ type: 'ASSIGNMENT' });
  expect(options.initialPageParam).toEqual({ path: { generationId: 25 }, query: {} });
});

it('수신자 현황도 공지 ID·기수 경로의 cursor 옵션을 사용한다', () => {
  const options = adminNoticeRecipientsQueryOptions(25, '101');
  const key = options.queryKey[0];

  expect(key.path).toEqual({ generationId: 25, postId: 101 });
  expect(options.initialPageParam).toEqual({
    path: { generationId: 25, postId: 101 },
    query: {},
  });
});
