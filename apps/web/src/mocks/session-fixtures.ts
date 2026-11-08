import type {
  CurrentGenerationSessionItemResponse,
  CurrentGenerationSessionsResponse,
  CurrentWeekSessionResponse,
} from '@yapp-plus/api/generated';
import { koreanDateString, koreanTimestamp } from '@/shared/lib/korean-date-time';

export type SessionFixtures = {
  currentWeekFixture: CurrentWeekSessionResponse;
  scheduleFixture: CurrentGenerationSessionsResponse;
};

export function createSessionFixtures(now: number) {
  const today = koreanDateString(now);
  const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay();
  const sunday = koreanTimestamp(today) - dayOfWeek * 86_400_000;
  const dateAt = (day: number) => koreanDateString(sunday + day * 86_400_000);
  const currentSession = {
    sessionId: 39902,
    name: '정규 세션 — 개발·디자인 교류',
    date: dateAt(6),
    dayOfWeek: 'SATURDAY',
    location: '교육장 A',
    startTime: '13:30:00',
    endTime: '18:00:00',
    type: 'REGULAR',
  } satisfies CurrentGenerationSessionItemResponse;

  return {
    currentWeekFixture: {
      weekStartDate: dateAt(0),
      weekEndDate: dateAt(6),
      session: {
        sessionId: currentSession.sessionId,
        name: currentSession.name,
        date: currentSession.date,
        startTime: currentSession.startTime,
        location: currentSession.location,
        // 시연은 실제 요일·시간에 관계없이 코드 입력을 확인할 수 있다.
        attendanceStatus: 'AVAILABLE',
      },
    } satisfies CurrentWeekSessionResponse,
    scheduleFixture: {
      generationId: 28,
      generationNumber: 28,
      sessions: [
        {
          ...currentSession,
          sessionId: 39901,
          name: '정규 세션 — 오리엔테이션',
          date: dateAt(-1),
        },
        currentSession,
        {
          ...currentSession,
          sessionId: 39903,
          name: '정규 세션 — 프로젝트 공유',
          date: dateAt(13),
          location: '교육장 B',
        },
      ],
    } satisfies CurrentGenerationSessionsResponse,
  };
}

/** 기본 개발 화면은 2주 뒤 토요일부터 예정된 일정만 제공한다. */
export function createUpcomingSessionFixtures(now: number): SessionFixtures {
  const fixtures = createSessionFixtures(now);
  const saturday = koreanTimestamp(fixtures.currentWeekFixture.weekEndDate);
  return {
    currentWeekFixture: { ...fixtures.currentWeekFixture, session: null },
    scheduleFixture: {
      ...fixtures.scheduleFixture,
      sessions: fixtures.scheduleFixture.sessions.map((session, index) => ({
        ...session,
        date: koreanDateString(saturday + (14 + index * 7) * 86_400_000),
      })),
    },
  };
}
