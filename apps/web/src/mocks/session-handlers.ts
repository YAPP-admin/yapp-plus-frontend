import { createAttendanceFixtures } from './attendance-fixtures';
import { createSessionFixtures, type SessionFixtures } from './session-fixtures';
import {
  zSubmitAttendanceReportRequest,
  type CurrentWeekAttendanceReportResponse,
} from '@yapp-plus/api/generated';
import { z } from 'zod';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

// 기존 화면 테스트는 고정된 주간을 사용하고 브라우저는 시작 시각으로 생성한다.
export const { currentWeekFixture, scheduleFixture } = createSessionFixtures(
  Date.parse('2026-11-07T12:00:00+09:00'),
);

export const createSessionHandlers = (
  baseUrl: string,
  scheduleState?: string | null,
  fixtures: SessionFixtures = createSessionFixtures(Date.now()),
  attendance = createAttendanceFixtures(fixtures),
) => {
  const { currentWeekFixture: currentWeek, scheduleFixture: schedule } = fixtures;
  let failNextScheduleRequest = scheduleState === 'error';
  const { pick } = createMswHandlers({ baseUrl });
  let report: CurrentWeekAttendanceReportResponse = {
    reportId: null,
    types: [],
    type: null,
    reason: null,
    submittedAt: null,
  };
  const reportSchema = zSubmitAttendanceReportRequest
    .extend({
      reason: z
        .string()
        .refine(
          (value) =>
            value.trim().length > 0 &&
            Array.from(value).length >= 2 &&
            Array.from(value).length <= 30,
        ),
    })
    .refine(
      ({ types }) =>
        new Set(types).size === types.length && (!types.includes('ABSENT') || types.length === 1),
    );
  const saveReport = (body: unknown) => {
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ code: 'INVALID_ATTENDANCE_REPORT' }, { status: 400 });
    }
    if (attendance.sessionId === null) {
      return HttpResponse.json({ code: 'ATTENDANCE_SESSION_NOT_FOUND' }, { status: 404 });
    }
    const unchanged =
      report.reason === parsed.data.reason &&
      report.types.length === parsed.data.types.length &&
      report.types.every((type) => parsed.data.types.includes(type));
    report = {
      ...parsed.data,
      type: parsed.data.types[0] ?? null,
      reportId: 1,
      submittedAt: unchanged ? report.submittedAt : new Date().toISOString(),
    };
    return HttpResponse.json({
      sessionId: attendance.sessionId,
      submittedAt: report.submittedAt,
      reportId: report.reportId,
    });
  };
  return [
    pick.currentWeek(() => HttpResponse.json(report)),
    pick.replace(async ({ request, params }) =>
      report.reportId !== null && String(report.reportId) === params.reportId
        ? saveReport(await request.json())
        : HttpResponse.json({ code: 'ATTENDANCE_REPORT_NOT_FOUND' }, { status: 404 }),
    ),
    pick.verify(async ({ request }) => {
      const { sessionId, code } = await request.json();
      if (attendance.sessionId === null) {
        return HttpResponse.json({ code: 'ATTENDANCE_UNAVAILABLE' }, { status: 409 });
      }
      if (sessionId !== attendance.sessionId) {
        return HttpResponse.json({ code: 'ATTENDANCE_SESSION_NOT_FOUND' }, { status: 404 });
      }
      if (code !== 1234) {
        return HttpResponse.json({ code: 'INVALID_ATTENDANCE_CODE' }, { status: 400 });
      }
      attendance.checkedInAt ??= new Date().toISOString();
      return HttpResponse.json({ verified: true, checkedInAt: attendance.checkedInAt });
    }),
    pick.submit1(async ({ request }) => {
      return report.reportId === null
        ? saveReport(await request.json())
        : HttpResponse.json({ code: 'ATTENDANCE_REPORT_ALREADY_EXISTS' }, { status: 409 });
    }),
    pick.find6(() =>
      HttpResponse.json({
        ...currentWeek,
        session:
          currentWeek.session?.sessionId === attendance.sessionId && attendance.checkedInAt
            ? { ...currentWeek.session, attendanceStatus: 'CHECKED_IN' }
            : currentWeek.session,
      }),
    ),
    pick.find7(async () => {
      if (scheduleState === 'loading') {
        await delay(5_000);
      }
      if (failNextScheduleRequest) {
        failNextScheduleRequest = false;
        return HttpResponse.json(
          { code: 'CURRENT_GENERATION_NOT_FOUND', message: '개발용 조회 실패' },
          { status: 500 },
        );
      }
      return HttpResponse.json(
        scheduleState === 'empty' ? { ...schedule, sessions: [] } : schedule,
      );
    }),
  ];
};
