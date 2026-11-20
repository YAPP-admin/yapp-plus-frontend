import { expect, it } from 'vitest';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { getCurrentWeekAttendance, getCurrentWeekSessionKind } from './current-week-attendance';

const session = currentWeekFixture.session;

it.each([
  ['장소가 null인 팀 세션', null, 'TEAM'],
  ['빈 장소인 정규 세션', '', 'REGULAR'],
  ['장소가 있는 정규 세션', '교육장 A', 'REGULAR'],
] as const)('%s을 임시 판별한다', (_, location, expected) => {
  expect(getCurrentWeekSessionKind({ ...session, location })).toBe(expected);
});

it.each([
  ['REGULAR', 'AVAILABLE', '출석하기', 'CODE', null],
  ['TEAM', 'AVAILABLE', '인증 사진 업로드하기', 'NONE', '팀 출석 기능을 준비 중이에요'],
  ['REGULAR', 'NOT_OPEN', '아직 출석할 수 없어요', 'NONE', null],
  ['TEAM', 'NOT_ELIGIBLE', '출석 대상이 아니에요', 'NONE', null],
  ['REGULAR', 'PENDING_APPROVAL', '출석 확인 중이에요', 'NONE', null],
  ['TEAM', 'CHECKED_IN', '출석했어요!', 'NONE', null],
] as const)(
  '%s %s 상태를 서버 기준으로 표시한다',
  (sessionKind, attendanceStatus, label, action, description) => {
    const attendance = getCurrentWeekAttendance({
      ...session,
      attendanceStatus,
      location: sessionKind === 'TEAM' ? null : '교육장 A',
    });

    expect(attendance).toMatchObject({ action, description, label, sessionKind });
  },
);
