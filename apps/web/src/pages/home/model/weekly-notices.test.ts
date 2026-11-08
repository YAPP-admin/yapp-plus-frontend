/** 홈 주간 공지 모델의 서울 시간대 경계와 표시 개수 정책을 검증한다. */
import { noticeListSchema } from '@/features/member-notice';
import { memberNoticeFixture } from '../../../mocks/member-notice-handlers';
import { expect, it } from 'vitest';
import { weeklyNotices } from './weekly-notices';

async function noticesWithDates(createdDates: readonly string[]) {
  return noticeListSchema.parseAsync({
    totalPostCount: createdDates.length,
    items: createdDates.map((createdDate, index) => ({
      ...memberNoticeFixture[index],
      createdDate,
    })),
    nextCursor: null,
  });
}

it('서울 토요일에는 이번 주 공지 중 서버 순서대로 세 건만 남긴다', async () => {
  const notices = await noticesWithDates(['2026-11-07', '2026-11-06', '2026-11-01', '2026-10-31']);

  expect(
    weeklyNotices(notices, Date.parse('2026-11-06T15:00:00Z')).map(({ postId }) => postId),
  ).toEqual([1, 2, 3]);
});

it('서울 일요일이 되면 지난주를 제외하고 새 주 공지만 남긴다', async () => {
  const notices = await noticesWithDates(['2026-11-08', '2026-11-07', '2026-11-01']);

  expect(
    weeklyNotices(notices, Date.parse('2026-11-07T15:00:00Z')).map(({ postId }) => postId),
  ).toEqual([1]);
});

it('이번 주 공지가 없거나 한 건이면 그대로 반환한다', async () => {
  const empty = await noticesWithDates(['2026-10-31']);
  const one = await noticesWithDates(['2026-11-07']);
  const saturday = Date.parse('2026-11-06T15:00:00Z');

  expect(weeklyNotices(empty, saturday)).toEqual([]);
  expect(weeklyNotices(one, saturday).map(({ postId }) => postId)).toEqual([1]);
});
