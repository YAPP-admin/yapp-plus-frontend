import { acknowledge, detail2, list1 } from '@yapp-plus/api/generated';
import { noticeListSchema } from '@/features/member-notice';
import { noticeDetailSchema } from '@/pages/notice-detail';
import { weeklyNotices } from '@/pages/home/model/weekly-notices';
import { beforeEach, expect, it } from 'vitest';
import { apiBaseUrl, server } from './server';
import { createUpcomingSessionFixtures } from './session-fixtures';
import { createNoticeFixtures } from './notice-fixtures';
import { createMemberNoticeHandlers } from './member-notice-handlers';

const now = Date.parse('2026-12-31T15:00:00Z');
const sessions = createUpcomingSessionFixtures(now);
const notices = createNoticeFixtures(sessions);
beforeEach(() => server.use(...createMemberNoticeHandlers(apiBaseUrl, undefined, notices)));

it('홈 주간 공지·목록·상세가 같은 두 공지를 표시하고 세션 날짜를 공유한다', async () => {
  const list = await noticeListSchema.parseAsync((await list1()).data);
  expect(list.totalPostCount).toBe(2);
  expect(weeklyNotices(list, now)).toEqual(list.items);
  for (const notice of list.items) {
    const detail = await noticeDetailSchema.parseAsync(
      (await detail2({ path: { postId: notice.postId } })).data,
    );
    expect(detail).toMatchObject({
      postId: notice.postId,
      title: notice.title,
      type: notice.type,
      createdDate: notice.createdDate,
    });
    expect(detail.title).not.toContain('[샘플]');
  }
  const sessionDetail = (await detail2({ path: { postId: 39901 } })).data;
  expect(sessionDetail?.contentMarkdown).toContain('2027-01-16');
  expect(sessionDetail?.contentMarkdown).toContain('교육장 A');
  expect(
    (await list1({ query: { type: 'SESSION' } })).data?.items.map(({ postId }) => postId),
  ).toEqual([39901]);
  expect((await list1({ query: { type: 'ASSIGNMENT' } })).data?.items).toEqual([]);
});

it('샘플 공지 하나의 읽음 처리가 다른 공지에 적용되지 않는다', async () => {
  await acknowledge({ path: { postId: 39901 } });
  expect((await detail2({ path: { postId: 39901 } })).data?.read).toBe(true);
  expect((await detail2({ path: { postId: 39902 } })).data?.read).toBe(false);
});
