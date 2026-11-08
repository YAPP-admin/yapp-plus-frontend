import { expect, it } from 'vitest';
import { createSessionFixtures, createUpcomingSessionFixtures } from './session-fixtures';

it.each([
  ['2026-11-07T14:59:59Z', '2026-11-01', '2026-11-07'],
  ['2026-11-07T15:00:00Z', '2026-11-08', '2026-11-14'],
  ['2026-12-31T15:00:00Z', '2026-12-27', '2027-01-02'],
])('한국 주간 경계와 연도 변경을 반영한다: %s', (now, start, end) => {
  const { currentWeekFixture, scheduleFixture } = createSessionFixtures(Date.parse(now));
  expect(currentWeekFixture.weekStartDate).toBe(start);
  expect(currentWeekFixture.weekEndDate).toBe(end);
  expect(currentWeekFixture.session.date).toBe(end);
  expect(scheduleFixture.sessions.map(({ date }) => new Date(date).getUTCDay())).toEqual([6, 6, 6]);
  const dates = scheduleFixture.sessions.map(({ date }) => Date.parse(date));
  expect(dates).toEqual([-7, 0, 7].map((offset) => Date.parse(end) + offset * 86_400_000));
});

it('홈의 출석 대상과 일정이 같은 정규 세션을 가리킨다', () => {
  const { currentWeekFixture, scheduleFixture } = createSessionFixtures(
    Date.parse('2026-11-08T00:00:00+09:00'),
  );
  const { attendanceStatus, ...session } = currentWeekFixture.session;
  expect(attendanceStatus).toBe('AVAILABLE');
  expect(
    scheduleFixture.sessions.find(({ sessionId }) => sessionId === session.sessionId),
  ).toMatchObject(session);
  expect(scheduleFixture.sessions.map(({ sessionId, type }) => [sessionId, type])).toEqual([
    [39901, 'REGULAR'],
    [39902, 'REGULAR'],
    [39903, 'REGULAR'],
  ]);
});

it('기본 일정은 2주 뒤 토요일부터 매주 열리고 이번 주 출석 대상은 없다', () => {
  const fixtures = createUpcomingSessionFixtures(Date.parse('2026-11-09T12:00:00+09:00'));
  expect(fixtures.currentWeekFixture.session).toBeNull();
  expect(fixtures.scheduleFixture.sessions.map(({ date }) => date)).toEqual([
    '2026-11-28',
    '2026-12-05',
    '2026-12-12',
  ]);
  expect(
    fixtures.scheduleFixture.sessions.every(
      ({ name, location }) => !name.includes('샘플') && !location?.includes('샘플'),
    ),
  ).toBe(true);
});
