import type {
  AttendanceHistoryResponse,
  MyAttendanceScoreResponse,
} from '@yapp-plus/api/generated';
import type { createSessionFixtures } from './session-fixtures';

export function createAttendanceFixtures(fixtures: ReturnType<typeof createSessionFixtures>) {
  const sessionId = fixtures.currentWeekFixture.session.sessionId;
  const state: {
    sessionId: number;
    checkedInAt: string | null;
    readonly history: AttendanceHistoryResponse;
    score: MyAttendanceScoreResponse;
  } = {
    sessionId,
    checkedInAt: null,
    get history(): AttendanceHistoryResponse {
      return {
        summary: { totalSessionCount: 3, startedSessionCount: 2 },
        items: fixtures.scheduleFixture.sessions
          .filter((session) => session.date <= fixtures.currentWeekFixture.session.date)
          .map((session) => ({
            sessionId: session.sessionId,
            sessionName: session.name,
            attendanceStatus:
              session.sessionId !== sessionId || state.checkedInAt ? 'PRESENT' : 'UNDECIDED',
            staffDecisionStatus: null,
          })),
        nextCursor: null,
      };
    },
    // 진행 중인 세션의 제출은 마감 세션 기준 집계에 포함하지 않는다.
    score: {
      generationId: fixtures.scheduleFixture.generationId,
      totalScore: 100,
      attendanceCount: 1,
      lateCount: 0,
      absentCount: 0,
      earlyLeaveCount: 0,
    } satisfies MyAttendanceScoreResponse,
  };
  return state;
}
