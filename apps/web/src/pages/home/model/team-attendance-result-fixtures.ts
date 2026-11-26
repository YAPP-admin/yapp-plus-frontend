/** 테스트와 개발 전용 미리보기의 읽기 전용 입력입니다. 운영 결과 조회에는 사용하지 않습니다. */
import type { TeamAttendanceResult } from './team-attendance-result';

const BASE = { sessionId: 101, name: '5주차 팀 세션', date: '2026-11-26', photoId: 203 };
const REJECTED = {
  ...BASE,
  kind: 'REJECTED',
  deadline: Date.parse('2026-11-26T18:00:00+09:00'),
  reupload: 'AVAILABLE',
} as const;

/** 각 항목은 API·시간 경과를 흉내 내지 않는 고정 화면 상태입니다. */
export const TEAM_ATTENDANCE_RESULT_FIXTURES = [
  { label: '인증 반려', result: REJECTED, showSession: false },
  { label: '결석', result: { ...BASE, kind: 'ABSENT' }, showSession: false },
  { label: '출석 완료', result: { ...BASE, kind: 'COMPLETED' }, showSession: false },
  { label: '과거 세션 결석', result: { ...BASE, kind: 'ABSENT' }, showSession: true },
  { label: '기한 종료', result: { ...REJECTED, reupload: 'EXPIRED' }, showSession: true },
  { label: '현재 제출 불가', result: { ...REJECTED, reupload: 'UNAVAILABLE' }, showSession: false },
  {
    label: '과거 세션 반려',
    result: REJECTED,
    showSession: true,
  },
] as const satisfies readonly {
  label: string;
  result: TeamAttendanceResult;
  showSession: boolean;
}[];
