import type {
  AttendanceHistoryResponse,
  MyAttendanceScoreResponse,
} from '@yapp-plus/api/generated';
import type { SessionFixtures } from './session-fixtures';

export function createAttendanceFixtures(fixtures: SessionFixtures) {
  const currentSession = fixtures.currentWeekFixture.session;
  const sessionId = currentSession?.sessionId ?? null;
  const startedSessions = fixtures.scheduleFixture.sessions.filter(
    (session) => currentSession !== null && session.date <= currentSession.date,
  );
  const state: {
    sessionId: number | null;
    checkedInAt: string | null;
    readonly history: AttendanceHistoryResponse;
    score: MyAttendanceScoreResponse;
  } = {
    sessionId,
    checkedInAt: null,
    get history(): AttendanceHistoryResponse {
      return {
        summary: {
          totalSessionCount: fixtures.scheduleFixture.sessions.length,
          startedSessionCount: startedSessions.length,
        },
        items: startedSessions.map((session) => ({
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
      attendanceCount: Math.max(0, startedSessions.length - 1),
      lateCount: 0,
      absentCount: 0,
      earlyLeaveCount: 0,
    } satisfies MyAttendanceScoreResponse,
  };
  return state;
}
