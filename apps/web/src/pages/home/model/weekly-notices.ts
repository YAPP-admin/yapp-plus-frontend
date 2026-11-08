/** 홈 첫 페이지 공지를 서울 기준 현재 주 범위로 제한하는 화면 전용 모델이다. */
import type { MemberNoticeList } from '@/features/member-notice';
import { koreanDateString, koreanTimestamp } from '@/shared/lib/korean-date-time';

const koreanWeekday = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  weekday: 'long',
});

/** 첫 목록 페이지에서 서울 일~토에 작성된 공지 세 개만 원래 서버 순서로 반환한다. */
export function weeklyNotices(notices: MemberNoticeList, now = Date.now()) {
  const today = koreanDateString(now);
  const dayIndex = koreanWeekdayIndex(now);
  const weekStart = koreanTimestamp(today) - dayIndex * 86_400_000;
  const weekEnd = weekStart + 7 * 86_400_000;

  return notices.items
    .filter((notice) => {
      const createdAt = koreanTimestamp(notice.createdDate);
      return createdAt >= weekStart && createdAt < weekEnd;
    })
    .slice(0, 3);
}

function koreanWeekdayIndex(now: number): number {
  switch (koreanWeekday.format(new Date(now))) {
    case 'Sunday':
      return 0;
    case 'Monday':
      return 1;
    case 'Tuesday':
      return 2;
    case 'Wednesday':
      return 3;
    case 'Thursday':
      return 4;
    case 'Friday':
      return 5;
    case 'Saturday':
      return 6;
    default:
      throw new Error('지원하지 않는 서울 요일입니다.');
  }
}
