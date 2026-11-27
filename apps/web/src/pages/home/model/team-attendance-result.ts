/** 생성 API의 본인 출결을 홈 결과 안내로 변환합니다. 조회 실패와 표시 이력은 호출자가 관리합니다. */
import type {
  AttendanceHistoryItemResponse,
  CurrentGenerationSessionItemResponse,
  CurrentWeekSessionResponse,
  UserTeamPhotoResponse,
} from '@yapp-plus/api/generated';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';

/** 최신 사진 ID와 개인 결과·반려 후속 행동만 제공합니다. 사유는 UI 고정 문구이므로 서버 사유를 전달하지 않습니다. */
export type TeamAttendanceResult = {
  sessionId: number;
  name: string;
  date: string;
  photoId: number | null;
} & (
  | { kind: 'ABSENT' | 'COMPLETED' }
  | {
      kind: 'REJECTED';
      deadline: number;
      reupload: 'AVAILABLE' | 'EXPIRED' | 'UNAVAILABLE';
    }
);

/** 시작된 팀 세션의 정상 조회 응답만 받습니다. 개인 확정 출결을 사진 심사보다 우선합니다. */
export function toTeamAttendanceResult(
  session: CurrentGenerationSessionItemResponse,
  attendance: AttendanceHistoryItemResponse,
  { photo }: UserTeamPhotoResponse,
  week: CurrentWeekSessionResponse,
  now: number,
): TeamAttendanceResult | null {
  if (
    session.type !== 'TEAM' ||
    session.sessionId !== attendance.sessionId ||
    now < koreanTimestamp(session.date, session.startTime)
  ) {
    return null;
  }
  const base = {
    sessionId: session.sessionId,
    name: session.name,
    date: session.date,
    photoId: photo?.photoId ?? null,
  };
  switch (attendance.attendanceStatus) {
    case 'ABSENT':
      return { ...base, kind: 'ABSENT' };
    case 'PRESENT':
    case 'LATE':
    case 'EARLY_LEAVE':
    case 'LATE_AND_EARLY_LEAVE':
      return { ...base, kind: 'COMPLETED' };
    case 'UNDECIDED': {
      if (attendance.staffDecisionStatus !== 'REJECTED' || photo?.status !== 'REJECTED') {
        return null;
      }
      const endDate =
        week.session?.sessionId === session.sessionId ? week.session.endDate : session.date;
      const deadline = koreanTimestamp(endDate, session.endTime);
      const canReupload =
        week.session?.sessionId === session.sessionId &&
        week.session.attendanceStatus === 'AVAILABLE';
      const beforeDeadline = canReupload ? 'AVAILABLE' : 'UNAVAILABLE';
      return {
        ...base,
        kind: 'REJECTED',
        deadline,
        reupload: now >= deadline ? 'EXPIRED' : beforeDeadline,
      };
    }
    case 'EXCUSED_ABSENCE':
    default:
      return null;
  }
}
