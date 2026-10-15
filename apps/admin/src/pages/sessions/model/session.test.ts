import { describe, expect, it } from 'vitest';
import {
  createSessionInputSchema,
  sessionAttendanceSummarySchema,
  sessionSchema,
  sortSessions,
} from './session';

const input = {
  name: '세션',
  location: '교육장',
  date: '2028-02-29',
  startTime: '09:00',
  endTime: '10:00',
  type: 'offline',
};

const attendance = { present: 0, late: 0, absent: 0, pending: 0, reported: 0 };

describe('세션 입력 검증', () => {
  it('윤년 날짜를 유지하고 공백과 저장하지 않는 항목을 제거한다', () => {
    const result = createSessionInputSchema.parse({
      ...input,
      name: ' 세션 ',
      location: ' 교육장 ',
      part: 'web',
      attendanceEnabled: true,
    });

    expect(result).toEqual(input);
  });

  it.each([
    { name: ' \n ' },
    { location: ' ' },
    { date: '2027-02-29' },
    { date: '2026-04-31' },
    { date: '2026-13-01' },
    { date: '2026-1-01' },
    { startTime: '24:00' },
    { startTime: '9:00' },
    { endTime: '10:60' },
    { endTime: '09:00' },
    { endTime: '08:59' },
    { startTime: '23:00', endTime: '01:00' },
    { type: 'all' },
  ])('잘못된 입력을 거부한다: %j', (change) => {
    expect(createSessionInputSchema.safeParse({ ...input, ...change }).success).toBe(false);
  });

  it('시간 역전 오류를 종료 시간에 연결한다', () => {
    const result = createSessionInputSchema.safeParse({ ...input, endTime: '08:00' });

    expect(result.error?.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['endTime'] })]),
    );
  });

  it.each([-1, 0.5, Number.NaN, Infinity])('유효하지 않은 출석 집계 %s를 거부한다', (count) => {
    expect(
      sessionAttendanceSummarySchema.safeParse({ ...attendance, present: count }).success,
    ).toBe(false);
  });

  it('입력만으로 조회 세션을 만들 수 없고 id와 집계가 필요하다', () => {
    expect(sessionSchema.safeParse(input).success).toBe(false);
    expect(sessionSchema.safeParse({ ...input, id: '', attendance }).success).toBe(false);
  });
});

describe('세션 정렬', () => {
  it('날짜·시작 시간 내림차순으로 정렬하고 동률 순서와 원본을 유지한다', () => {
    const sessions = [
      { id: 'old', date: '2027-12-31', startTime: '23:00', endTime: '23:59' },
      { id: 'first', date: '2028-01-01', startTime: '09:00', endTime: '10:00' },
      { id: 'second', date: '2028-01-01', startTime: '09:00', endTime: '10:00' },
      { id: 'latest', date: '2028-01-01', startTime: '14:00', endTime: '15:00' },
    ].map((fields) => sessionSchema.parse({ ...input, attendance, ...fields }));

    expect(sortSessions(sessions).map(({ id }) => id)).toEqual([
      'latest',
      'first',
      'second',
      'old',
    ]);
    expect(sessions.map(({ id }) => id)).toEqual(['old', 'first', 'second', 'latest']);
  });
});
