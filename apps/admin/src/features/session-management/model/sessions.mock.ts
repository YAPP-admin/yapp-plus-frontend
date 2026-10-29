import {
  createMockAttendanceSession,
  createMockSessionMembers,
  mockSessionMemberCount,
} from './mocks/session-attendance';
import {
  createSessionInputSchema,
  sessionSchema,
  sortSessions,
  type CreateSessionInput,
  type Session,
} from './session';

// 실제 운영 일정이나 회원 정보가 아닌 화면 검증용 예시입니다.
// 오프라인 위치는 서울시청 테스트 좌표이며 실제 세션 장소가 아닙니다.
const fixtures: Session[] = [
  {
    id: 'demo-offline-session',
    name: '개발용 오프라인 세션',
    location: {
      roadAddress: '서울특별시 중구 세종대로 110',
      detailAddress: '예시 교육장',
      latitude: 37.5665,
      longitude: 126.978,
    },
    date: '2026-10-17',
    startTime: '14:00',
    endTime: '17:00',
    type: 'offline',
    attendance: { present: 30, late: 2, absent: 1, pending: 5, reported: 3 },
  },
  {
    id: 'demo-team-session',
    name: '개발용 팀 세션',
    location: { guide: '' },
    date: '2026-10-24',
    startTime: '13:00',
    endTime: '16:00',
    type: 'team',
    attendance: { present: 0, late: 0, absent: 0, pending: 40, reported: 0 },
  },
];

export function createSessionStore(initialSessions: readonly Session[] = fixtures) {
  let sessions = sessionSchema.array().parse(initialSessions);
  const attendanceBySession = new Map(
    sessions.map((session) => [session.id, createMockSessionMembers(session)]),
  );

  return {
    listSessions(): Session[] {
      return sessionSchema.array().parse(sortSessions(sessions));
    },

    getSessionAttendance(id: string) {
      const session = sessions.find((entry) => entry.id === id);
      const members = attendanceBySession.get(id);
      if (!session || !members) {
        throw new Error('출석을 조회할 세션을 찾을 수 없습니다.');
      }
      return structuredClone({ session: createMockAttendanceSession(session, members), members });
    },

    createSession(input: CreateSessionInput): Session {
      const fields = createSessionInputSchema.parse(input);
      const session = sessionSchema.parse({
        ...fields,
        id: crypto.randomUUID(),
        attendance: {
          present: 0,
          late: 0,
          absent: 0,
          pending: mockSessionMemberCount,
          reported: 0,
        },
      });

      attendanceBySession.set(session.id, createMockSessionMembers(session));
      sessions = [...sessions, session];
      return sessionSchema.parse(session);
    },

    /** 입력 전체를 교체하되 기존 식별자와 출석 집계는 보존합니다. */
    updateSession(id: string, input: CreateSessionInput): Session {
      const previous = sessions.find((session) => session.id === id);
      if (!previous) {
        throw new Error('수정할 세션을 찾을 수 없습니다.');
      }

      const updated = sessionSchema.parse({
        ...createSessionInputSchema.parse(input),
        id: previous.id,
        attendance: previous.attendance,
      });
      sessions = sessions.map((session) => (session.id === id ? updated : session));
      return sessionSchema.parse(updated);
    },

    deleteSession(id: string): void {
      if (!sessions.some((session) => session.id === id)) {
        throw new Error('삭제할 세션을 찾을 수 없습니다.');
      }

      sessions = sessions.filter((session) => session.id !== id);
      attendanceBySession.delete(id);
    },
  };
}

let browserStore: ReturnType<typeof createSessionStore> | undefined;

export function getBrowserSessionStore() {
  if (import.meta.env.SSR || typeof window === 'undefined') {
    throw new Error('모의 세션 저장소는 브라우저에서만 사용할 수 있습니다.');
  }

  browserStore ??= createSessionStore();
  return browserStore;
}
