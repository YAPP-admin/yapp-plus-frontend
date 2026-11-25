/** 사전 출결 보고 안내 말풍선의 한국 시간 표시 구간을 검증합니다. */
import { expect, it } from 'vitest';
import type { CurrentWeekSessionResponse } from '@yapp-plus/api/generated';
import {
  getAttendanceReportHelpBubbleWindow,
  isAttendanceReportHelpBubbleOpen,
} from './attendance-report-help-bubble';

const week = {
  weekStartDate: '2026-11-01',
  weekEndDate: '2026-11-07',
  session: {
    sessionId: 1,
    type: 'REGULAR',
    name: '정규 세션',
    date: '2026-11-07',
    startTime: '13:30:00',
    endTime: '18:00:00',
    location: '교육장 A',
    attendanceStatus: 'NOT_OPEN',
    roadAddress: null,
    latitude: null,
    longitude: null,
    detailAddress: null,
  },
} satisfies CurrentWeekSessionResponse;

it('세션 주 월요일 오전 9시부터 토요일 세션 시작 전까지의 한국 시간 표시 구간을 계산한다', () => {
  expect(getAttendanceReportHelpBubbleWindow(week)).toEqual({
    startsAt: Date.parse('2026-11-02T00:00:00Z'),
    endsAt: Date.parse('2026-11-07T04:30:00Z'),
  });
  expect(isAttendanceReportHelpBubbleOpen(week, Date.parse('2026-11-01T23:59:59.999Z'))).toBe(
    false,
  );
  expect(isAttendanceReportHelpBubbleOpen(week, Date.parse('2026-11-02T00:00:00Z'))).toBe(true);
  expect(isAttendanceReportHelpBubbleOpen(week, Date.parse('2026-11-07T04:29:59.999Z'))).toBe(true);
  expect(isAttendanceReportHelpBubbleOpen(week, Date.parse('2026-11-07T04:30:00Z'))).toBe(false);
});

it('연말을 지나는 주와 초가 생략된 세션 시각도 한국 시간으로 계산한다', () => {
  const yearBoundaryWeek = {
    ...week,
    weekStartDate: '2025-12-28',
    weekEndDate: '2026-01-03',
    session: { ...week.session, date: '2026-01-03', startTime: '14:00' },
  };

  expect(getAttendanceReportHelpBubbleWindow(yearBoundaryWeek)).toEqual({
    startsAt: Date.parse('2025-12-29T00:00:00Z'),
    endsAt: Date.parse('2026-01-03T05:00:00Z'),
  });
});

it('세션이 없거나 주간 종료일이 월요일보다 이르면 안내를 표시하지 않는다', () => {
  expect(getAttendanceReportHelpBubbleWindow({ ...week, session: null })).toBeNull();
  expect(
    getAttendanceReportHelpBubbleWindow({
      ...week,
      weekEndDate: '2026-11-01',
    }),
  ).toBeNull();
});
