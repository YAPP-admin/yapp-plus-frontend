import type { CurrentWeekSessionResponse } from '@yapp-plus/api/generated';

type CurrentWeekSession = NonNullable<CurrentWeekSessionResponse['session']>;

export type CurrentWeekSessionKind = 'REGULAR' | 'TEAM';

type CurrentWeekAttendanceAction = 'CODE' | 'NONE';

type CurrentWeekAttendance = Readonly<{
  action: CurrentWeekAttendanceAction;
  description: string | null;
  label: string;
  sessionKind: CurrentWeekSessionKind;
}>;

const unavailableLabels = {
  NOT_ELIGIBLE: '출석 대상이 아니에요',
  NOT_OPEN: '아직 출석할 수 없어요',
  CHECKED_IN: '출석했어요!',
  PENDING_APPROVAL: '출석 확인 중이에요',
} as const;

/**
 * 서버가 유형을 제공하기 전까지 장소 null을 팀 세션으로 판별합니다.
 * current-week.session.type이 제공되면 이 임시 판별과 관련 테스트를 제거합니다.
 */
export function getCurrentWeekSessionKind(
  session: Pick<CurrentWeekSession, 'location'>,
): CurrentWeekSessionKind {
  return session.location === null ? 'TEAM' : 'REGULAR';
}

/** 서버 출석 상태를 홈의 문구와 진입 행동으로 변환합니다. */
export function getCurrentWeekAttendance(session: CurrentWeekSession): CurrentWeekAttendance {
  const sessionKind = getCurrentWeekSessionKind(session);

  if (session.attendanceStatus !== 'AVAILABLE') {
    return {
      action: 'NONE',
      description: null,
      label: unavailableLabels[session.attendanceStatus],
      sessionKind,
    };
  }

  if (sessionKind === 'TEAM') {
    return {
      action: 'NONE',
      description: '팀 출석 기능을 준비 중이에요',
      label: '인증 사진 업로드하기',
      sessionKind,
    };
  }

  return { action: 'CODE', description: null, label: '출석하기', sessionKind };
}
