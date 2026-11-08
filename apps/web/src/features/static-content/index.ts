import { createUpcomingSessionFixtures } from '@/mocks/session-fixtures';
import { createNoticeFixtures } from '@/mocks/notice-fixtures';
import type { UserPostListItemResponse } from '@yapp-plus/api/generated';

export const staticContentEnabled = () => import.meta.env.VITE_STATIC_CONTENT === 'true';
const fixtures = createUpcomingSessionFixtures(Date.now());
const notices = createNoticeFixtures(fixtures);
const readIds = new Set<number>();
let readOwner: string | undefined;

function readsFor(owner?: string) {
  if (readOwner !== owner) {
    readOwner = owner;
    readIds.clear();
  }
  return readIds;
}

export const getStaticCurrentWeek = () => Promise.resolve(fixtures.currentWeekFixture);
export const getStaticSchedule = () => Promise.resolve(fixtures.scheduleFixture);

export function getStaticNotices(category: UserPostListItemResponse['type'] | 'ALL') {
  const items = notices
    .filter(({ type }) => category === 'ALL' || type === category)
    .map(({ postId, type, title, createdDate }) => ({
      postId,
      type,
      title,
      createdDate,
      daysUntilDeadline: null,
    }));
  return Promise.resolve({ totalPostCount: items.length, items, nextCursor: null });
}

export function getStaticNotice(postId: number, owner?: string) {
  const notice = notices.find((item) => item.postId === postId);
  if (!notice) {
    return Promise.reject(
      Object.assign(new Error('공지를 찾지 못했어요.'), { code: 'POST_NOT_FOUND' }),
    );
  }
  const read = readsFor(owner).has(postId);
  return Promise.resolve({ ...notice, read, readCount: read ? 1 : 0 });
}

export function markStaticNoticeRead(postId: number, owner?: string): Promise<void> {
  if (!notices.some((item) => item.postId === postId)) {
    return Promise.reject(
      Object.assign(new Error('공지를 찾지 못했어요.'), { code: 'POST_NOT_FOUND' }),
    );
  }
  readsFor(owner).add(postId);
  return Promise.resolve();
}
