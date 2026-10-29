import { attendanceResultSchema } from '../attendance';
import type {
  AttendanceMemberViewModel,
  AttendanceSessionViewModel,
} from '../attendance-view-model';
import type { Session } from '../session';
import { calculateMockAttendanceDelta } from './attendance-score';

export const mockSessionMemberCount = 40;
const parts = ['pm', 'design', 'android', 'ios', 'web', 'server'];

// 기존 예시 집계와 일치하는 가상 명단입니다. 보고 적격성은 실제 정책 계산이 아닌 모의 값입니다.
export function createMockSessionMembers(session: Session): AttendanceMemberViewModel[] {
  const { present, late, absent, pending, reported } = session.attendance;
  const statuses = [
    { status: 'present', count: present },
    { status: 'late', count: late },
    { status: 'absent', count: absent },
    { status: 'undecided', count: pending },
  ].flatMap(({ status, count }) => Array.from({ length: count }, () => status));
  return statuses.map((status, index) => {
    const membershipId = `mock-member-${index + 1}`;
    const attendance = attendanceResultSchema.parse({
      status,
      penaltyCategory: status === 'late' || status === 'absent' ? 'regular' : null,
      durationBand: status === 'late' ? 'withinOneHour' : null,
      checkedInAt: null,
      earlyLeaveAt: null,
      reason: null,
      explicitlyOverridden: false,
    });
    const delta = calculateMockAttendanceDelta(attendance);
    return {
      membershipId,
      name: `가상 회원 ${index + 1}`,
      part: parts[index % parts.length] ?? null,
      teamId: `mock-team-${Math.floor(index / 5) + 1}`,
      attendance,
      latestReport:
        index < reported
          ? {
              id: `${session.id}-report-${index + 1}`,
              membershipId,
              type: 'late',
              reason: '화면 검증용 사전 보고',
              submittedAt: null,
              eligibility: 'eligible',
            }
          : null,
      badge: { verified: false, verifiedAt: null },
      score:
        delta === null
          ? { source: 'unknown', delta: null, description: '미정' }
          : { source: 'mock', delta, description: '모의 출결 점수' },
      isEditable: true,
    };
  });
}

export function createMockAttendanceSession(
  session: Session,
  members: AttendanceMemberViewModel[],
): AttendanceSessionViewModel {
  const count = (status: string) =>
    members.filter((member) => member.attendance.status === status).length;
  return {
    id: session.id,
    generationId: 'mock-generation',
    title: session.name,
    type: session.type,
    startsAt: `${session.date}T${session.startTime}:00+09:00`,
    endsAt: `${session.date}T${session.endTime}:00+09:00`,
    phase: 'open',
    canCancelClose: false,
    summary: {
      total: members.length,
      present: count('present'),
      late: count('late'),
      earlyLeave: count('earlyLeave'),
      absent: count('absent'),
      undecided: count('undecided'),
      reported: members.filter((member) => member.latestReport !== null).length,
    },
  };
}
