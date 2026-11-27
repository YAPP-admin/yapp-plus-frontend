/** 사전 출결 보고 안내 말풍선의 표시 기간을 한국 시간으로 계산합니다. */
import type { CurrentWeekSessionResponse } from '@yapp-plus/api/generated';
import { koreanTimestamp, nextKoreanMidnight } from '@/shared/lib/korean-date-time';

type AttendanceReportHelpBubbleWeek = Pick<
  CurrentWeekSessionResponse,
  'weekStartDate' | 'weekEndDate' | 'session'
>;

export type AttendanceReportHelpBubbleWindow = Readonly<{
  startsAt: number;
  endsAt: number;
}>;

/**
 * 주간 응답의 일요일 시작일과 토요일 종료일로 말풍선이 표시될 한국 시간 구간을 만듭니다.
 * 세션이 없거나 주간 범위가 유효하지 않으면 안내를 표시하지 않습니다.
 */
export function getAttendanceReportHelpBubbleWindow(
  week: AttendanceReportHelpBubbleWeek,
): AttendanceReportHelpBubbleWindow | null {
  if (!week.session) {
    return null;
  }

  const startsAt = nextKoreanMidnight(week.weekStartDate) + 9 * 60 * 60_000;
  const endsAt = koreanTimestamp(week.weekEndDate, week.session.startTime);

  return startsAt < endsAt ? { startsAt, endsAt } : null;
}

/** 현재 시각이 안내의 한국 시간 표시 구간 안에 있는지 판정합니다. */
export function isAttendanceReportHelpBubbleOpen(
  week: AttendanceReportHelpBubbleWeek,
  now = Date.now(),
): boolean {
  const window = getAttendanceReportHelpBubbleWindow(week);

  return window !== null && window.startsAt <= now && now < window.endsAt;
}
