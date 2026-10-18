/** 화면 이동 중 변경을 유지하고 새로고침하면 초기화되는 개발용 세션 메모리 저장소입니다. */
import {
  createSessionInputSchema,
  sessionSchema,
  sortSessions,
  type CreateSessionInput,
  type Session,
} from './session';

// 실제 운영 일정이나 회원 정보가 아닌 화면 검증용 예시입니다.
const fixtures: Session[] = [
  {
    id: 'demo-offline-session',
    name: '개발용 오프라인 세션',
    location: '예시 교육장',
    date: '2026-10-17',
    startTime: '14:00',
    endTime: '17:00',
    type: 'offline',
    attendance: { present: 30, late: 2, absent: 1, pending: 5, reported: 3 },
  },
  {
    id: 'demo-team-session',
    name: '개발용 팀 세션',
    location: '팀별 자율 장소',
    date: '2026-10-24',
    startTime: '13:00',
    endTime: '16:00',
    type: 'team',
    attendance: { present: 0, late: 0, absent: 0, pending: 40, reported: 0 },
  },
];

export function createSessionStore(initialSessions: readonly Session[] = fixtures) {
  let sessions = sessionSchema.array().parse(initialSessions);

  return {
    listSessions(): Session[] {
      return sessionSchema.array().parse(sortSessions(sessions));
    },

    createSession(input: CreateSessionInput): Session {
      const fields = createSessionInputSchema.parse(input);
      const session = sessionSchema.parse({
        ...fields,
        id: crypto.randomUUID(),
        attendance: { present: 0, late: 0, absent: 0, pending: 0, reported: 0 },
      });

      sessions = [...sessions, session];
      return sessionSchema.parse(session);
    },

    deleteSession(id: string): void {
      if (!sessions.some((session) => session.id === id)) {
        throw new Error('삭제할 세션을 찾을 수 없습니다.');
      }

      sessions = sessions.filter((session) => session.id !== id);
    },
  };
}

let browserStore: ReturnType<typeof createSessionStore> | undefined;

export function getBrowserSessionStore() {
  if (!import.meta.env.DEV || import.meta.env.SSR || typeof window === 'undefined') {
    throw new Error('모의 세션 저장소는 개발 브라우저에서만 사용할 수 있습니다.');
  }

  browserStore ??= createSessionStore();
  return browserStore;
}
