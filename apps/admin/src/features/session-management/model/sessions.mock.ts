import { attendanceResultSchema } from './attendance';
import {
  attendanceEditInputSchema,
  badgeEditInputSchema,
  teamDecisionInputSchema,
  type AttendanceEditInput,
  type BadgeEditInput,
  type TeamDecisionInput,
} from './attendance-input';
import type { AttendanceHistoryEntry } from './attendance-view-model';
import { calculateMockAttendanceDelta } from './mocks/attendance-score';
import { createMockTeamReviews } from './mocks/team-reviews';
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
    attendance: { present: 30, late: 2, earlyLeave: 0, absent: 1, pending: 5, reported: 3 },
  },
  {
    id: 'demo-team-session',
    name: '개발용 팀 세션',
    location: { guide: '' },
    date: '2026-10-24',
    startTime: '13:00',
    endTime: '16:00',
    type: 'team',
    attendance: { present: 0, late: 0, earlyLeave: 0, absent: 0, pending: 40, reported: 0 },
  },
];

export type AttendanceMockOperation =
  | 'read'
  | 'history'
  | 'attendance'
  | 'badge'
  | 'teamRead'
  | 'teamDecision'
  | 'close'
  | 'cancel';

export function createSessionStore(initialSessions: readonly Session[] = fixtures) {
  let sessions = sessionSchema.array().parse(initialSessions);
  const attendanceBySession = new Map(
    sessions.map((session) => [session.id, createMockSessionMembers(session)]),
  );
  const teamReviewsBySession = new Map(
    sessions.map((session) => [
      session.id,
      session.type === 'team'
        ? createMockTeamReviews(session, attendanceBySession.get(session.id) ?? [])
        : [],
    ]),
  );

  const historyBySession = new Map<string, AttendanceHistoryEntry[]>();
  const closedSessions = new Set<string>();
  let failures: { operation: AttendanceMockOperation; sessionId: string; membershipId?: string }[] =
    [];

  function checkFailure(
    operation: AttendanceMockOperation,
    sessionId: string,
    membershipId?: string,
  ) {
    const index = failures.findIndex(
      (failure) =>
        failure.operation === operation &&
        failure.sessionId === sessionId &&
        failure.membershipId === membershipId,
    );
    if (index >= 0) {
      failures.splice(index, 1);
      throw new Error('모의 요청에 실패했습니다. 다시 시도해 주세요.');
    }
  }

  function getContext(sessionId: string) {
    const session = sessions.find((entry) => entry.id === sessionId);
    const members = attendanceBySession.get(sessionId);
    if (!session || !members) {
      throw new Error('출석을 조회할 세션을 찾을 수 없습니다.');
    }
    return { session, members };
  }

  function getMember(sessionId: string, membershipId: string) {
    const context = getContext(sessionId);
    const member = context.members.find((entry) => entry.membershipId === membershipId);
    if (!member) {
      throw new Error('출결을 변경할 회원을 찾을 수 없습니다.');
    }
    return { ...context, member };
  }

  return {
    listSessions(): Session[] {
      return sessionSchema.array().parse(sortSessions(sessions));
    },

    getSessionAttendance(id: string) {
      const { session, members } = getContext(id);
      checkFailure('read', id);
      return structuredClone({ session: createMockAttendanceSession(session, members), members });
    },

    getTeamReviews(sessionId: string) {
      const { session } = getContext(sessionId);
      if (session.type !== 'team') {
        throw new Error('팀 세션의 사진 검수만 조회할 수 있습니다.');
      }
      checkFailure('teamRead', sessionId);
      return structuredClone(teamReviewsBySession.get(sessionId) ?? []);
    },

    updateTeamPhotoReview(sessionId: string, input: TeamDecisionInput) {
      const decision = teamDecisionInputSchema.parse(input);
      const { session } = getContext(sessionId);
      if (session.type !== 'team') {
        throw new Error('팀 세션의 사진 검수만 변경할 수 있습니다.');
      }
      if (closedSessions.has(sessionId)) {
        throw new Error('마감된 세션은 사진 검수를 변경할 수 없습니다.');
      }
      checkFailure('teamDecision', sessionId, decision.photoId);
      const reviews = teamReviewsBySession.get(sessionId) ?? [];
      const review = reviews.find((entry) => entry.photo?.photoId === decision.photoId);
      if (!review?.photo) {
        throw new Error('검수할 사진을 찾을 수 없습니다.');
      }
      review.reviewState = decision.decision === 'approve' ? 'approved' : 'rejected';
      review.decisionDraft = null;
      return structuredClone(review);
    },

    closeAttendance(sessionId: string) {
      const { session, members } = getContext(sessionId);
      checkFailure('close', sessionId);
      if (closedSessions.has(sessionId)) {
        throw new Error('이미 마감된 세션입니다.');
      }
      if (
        session.type === 'team' &&
        (teamReviewsBySession.get(sessionId) ?? []).some(
          (review) => review.reviewState === 'pending',
        )
      ) {
        throw new Error('검수 대기 사진이 있어 출석을 마감할 수 없습니다.');
      }
      members.forEach((member) => {
        if (member.attendance.status !== 'undecided') {
          member.isEditable = false;
          return;
        }
        const after = attendanceResultSchema.parse({
          ...member.attendance,
          status: 'absent',
          penaltyCategory:
            member.latestReport?.eligibility === 'eligible' ? 'regular' : 'unauthorized',
          durationBand: null,
          explicitlyOverridden: false,
        });
        member.attendance = after;
        const delta = calculateMockAttendanceDelta(after);
        member.score =
          delta === null
            ? { source: 'unknown', delta: null, description: '미정' }
            : { source: 'mock', delta, description: '모의 출결 점수' };
        member.isEditable = false;
      });
      closedSessions.add(sessionId);
      const summary = createMockAttendanceSession(session, members).summary;
      session.attendance = {
        present: summary.present,
        late: summary.late,
        earlyLeave: summary.earlyLeave,
        absent: summary.absent,
        pending: summary.undecided,
        reported: summary.reported,
      };
      return structuredClone({ session: createMockAttendanceSession(session, members), members });
    },

    cancelAttendance(sessionId: string) {
      const context = getContext(sessionId);
      checkFailure('cancel', sessionId);
      if (!closedSessions.has(sessionId)) {
        throw new Error('마감된 세션만 취소할 수 있습니다.');
      }
      closedSessions.delete(sessionId);
      context.members.forEach((member) => {
        member.isEditable = true;
      });
      return structuredClone({
        session: createMockAttendanceSession(context.session, context.members),
        members: context.members,
      });
    },

    getAttendanceHistory(sessionId: string, membershipId: string) {
      getMember(sessionId, membershipId);
      checkFailure('history', sessionId, membershipId);
      return structuredClone(
        (historyBySession.get(sessionId) ?? []).filter(
          (entry) => entry.membershipId === membershipId,
        ),
      );
    },

    updateMemberAttendance(sessionId: string, input: AttendanceEditInput) {
      const edit = attendanceEditInputSchema.parse(input);
      const { session, members, member } = getMember(sessionId, edit.membershipId);
      if (closedSessions.has(sessionId)) {
        throw new Error('마감된 세션은 출결을 변경할 수 없습니다.');
      }
      checkFailure('attendance', sessionId, edit.membershipId);
      const before = member.attendance;
      const unchanged =
        before.explicitlyOverridden &&
        before.status === edit.status &&
        before.penaltyCategory === edit.penaltyCategory &&
        before.durationBand === edit.durationBand &&
        before.reason === edit.reason;
      if (unchanged) {
        return structuredClone(member);
      }
      const after = attendanceResultSchema.parse({
        ...before,
        ...edit,
        explicitlyOverridden: true,
      });
      const delta = calculateMockAttendanceDelta(after);
      member.attendance = after;
      member.score =
        delta === null
          ? { source: 'unknown', delta: null, description: '미정' }
          : { source: 'mock', delta, description: '운영진 정정 모의 점수' };
      const summary = createMockAttendanceSession(session, members).summary;
      session.attendance = {
        present: summary.present,
        late: summary.late,
        earlyLeave: summary.earlyLeave,
        absent: summary.absent,
        pending: summary.undecided,
        reported: summary.reported,
      };
      historyBySession.set(sessionId, [
        {
          id: crypto.randomUUID(),
          membershipId: edit.membershipId,
          changedAt: new Date().toISOString(),
          actorName: '모의 운영진',
          before: structuredClone(before),
          after: structuredClone(after),
          reason: edit.reason,
        },
        ...(historyBySession.get(sessionId) ?? []),
      ]);
      return structuredClone(member);
    },

    updateMemberBadge(sessionId: string, input: BadgeEditInput) {
      const edit = badgeEditInputSchema.parse(input);
      const { member } = getMember(sessionId, edit.membershipId);
      if (closedSessions.has(sessionId)) {
        throw new Error('마감된 세션은 명찰을 변경할 수 없습니다.');
      }
      checkFailure('badge', sessionId, edit.membershipId);
      if (member.badge.verified !== edit.verified) {
        member.badge = {
          verified: edit.verified,
          verifiedAt: edit.verified ? new Date().toISOString() : null,
        };
      }
      return structuredClone(member);
    },

    // 대상 요청 한 번만 실패시켜 부분 성공 후 재시도를 확인합니다.
    failNextAttendanceOperation(
      operation: AttendanceMockOperation,
      sessionId: string,
      membershipId?: string,
    ) {
      failures.push({ operation, sessionId, membershipId });
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
      teamReviewsBySession.set(
        session.id,
        session.type === 'team'
          ? createMockTeamReviews(session, attendanceBySession.get(session.id) ?? [])
          : [],
      );
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
      teamReviewsBySession.delete(id);
      historyBySession.delete(id);
      closedSessions.delete(id);
      failures = failures.filter((failure) => failure.sessionId !== id);
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
