import type { createAttendanceFixtures } from './attendance-fixtures';
import type {
  MyAttendanceScoreResponse,
  AttendanceHistoryResponse,
  AttendanceHistoryItemResponse,
} from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

export const scoreFixture = {
  generationId: 28,
  totalScore: 92,
  attendanceCount: 3,
  lateCount: 1,
  absentCount: 0,
  earlyLeaveCount: 0,
} satisfies MyAttendanceScoreResponse;

export const createMemberAttendanceHandlers = (
  baseUrl: string,
  myState?: string | null,
  attendanceState?: string | null,
  attendance?: ReturnType<typeof createAttendanceFixtures>,
) => {
  let failHistory = attendanceState === 'error' || attendanceState === 'next-error';
  let failNextRequest = myState === 'error';
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.find6(async ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      if (attendanceState === 'loading') {
        await delay(5_000);
      }
      if (failHistory && (attendanceState === 'error' || cursor !== null)) {
        failHistory = false;
        return HttpResponse.json(
          { code: 'HISTORY_UNAVAILABLE', message: '개발용 내역 조회 실패' },
          { status: 500 },
        );
      }
      if (attendanceState === 'empty') {
        return HttpResponse.json({ ...historyFixture, items: [], nextCursor: null });
      }
      if (attendance && attendanceState !== 'next-error') {
        return HttpResponse.json(attendance.history);
      }
      const start = cursor === null ? 0 : Number(cursor);
      const items = historyItems.slice(start, start + 4);
      return HttpResponse.json({
        ...historyFixture,
        items,
        nextCursor: start + 4 < historyItems.length ? String(start + 4) : null,
      });
    }),
    pick.mine(async () => {
      if (myState === 'loading') {
        await delay(5_000);
      }
      if (myState === 'ineligible' || myState === 'no-generation') {
        return HttpResponse.json(
          {
            code:
              myState === 'ineligible'
                ? 'ATTENDANCE_SCORE_NOT_ELIGIBLE'
                : 'CURRENT_GENERATION_NOT_FOUND',
            message: '개발용 조회 대상 없음',
          },
          { status: myState === 'ineligible' ? 403 : 404 },
        );
      }
      if (failNextRequest) {
        failNextRequest = false;
        return HttpResponse.json(
          { code: 'ATTENDANCE_UNAVAILABLE', message: '개발용 조회 실패' },
          { status: 500 },
        );
      }
      const score = attendance?.score ?? scoreFixture;
      return HttpResponse.json({
        ...score,
        absentCount: attendanceState === 'warning' ? 10 : score.absentCount,
      });
    }),
  ];
};

const statuses: AttendanceHistoryItemResponse['attendanceStatus'][] = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'EARLY_LEAVE',
  'LATE_AND_EARLY_LEAVE',
  'EXCUSED_ABSENCE',
];
const decisions: AttendanceHistoryItemResponse['staffDecisionStatus'][] = [
  'PENDING',
  'REJECTED',
  'NOT_SUBMITTED',
  'NOT_SELECTED',
  'APPROVED',
  null,
];
const historyItems: AttendanceHistoryItemResponse[] = [
  ...statuses.map((attendanceStatus, index) => ({
    sessionId: index + 1,
    sessionName: `세션 ${index + 1}`,
    attendanceStatus,
    staffDecisionStatus: null,
  })),
  ...decisions.map((staffDecisionStatus, index) => ({
    sessionId: index + 7,
    sessionName: `세션 ${index + 7}`,
    attendanceStatus: 'UNDECIDED' as const,
    staffDecisionStatus,
  })),
];
export const historyFixture: AttendanceHistoryResponse = {
  summary: { totalSessionCount: 12, startedSessionCount: 7 },
  items: historyItems,
  nextCursor: null,
};
