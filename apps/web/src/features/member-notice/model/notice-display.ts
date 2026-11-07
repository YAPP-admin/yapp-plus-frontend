import type { UserPostListItemResponse } from '@yapp-plus/api/generated';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';

export type MemberNoticeCategory = Exclude<UserPostListItemResponse['type'], never>;

const categoryLabels: Record<MemberNoticeCategory, string> = {
  SESSION: '세션',
  ASSIGNMENT: '과제',
  OPERATION: '기타',
};

export function memberNoticeCategoryLabel(category: MemberNoticeCategory): string {
  return categoryLabels[category];
}

export function memberNoticeDateLabel(date: string): string {
  const timestamp = koreanTimestamp(date);
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
    .format(new Date(timestamp))
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

export function memberNoticeDeadlineLabel(daysUntilDeadline: number | null): string | undefined {
  if (daysUntilDeadline === null) {
    return undefined;
  }
  if (daysUntilDeadline === 0) {
    return 'D-day';
  }
  return daysUntilDeadline > 0 ? `D-${daysUntilDeadline}` : `D+${-daysUntilDeadline}`;
}
