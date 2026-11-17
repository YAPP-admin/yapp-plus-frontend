import { find4, find6, mine, submit1, verify } from '@yapp-plus/api/generated';
import { beforeEach, expect, it } from 'vitest';
import { apiBaseUrl, server } from './server';
import { createSessionFixtures, createUpcomingSessionFixtures } from './session-fixtures';
import { createAttendanceFixtures } from './attendance-fixtures';
import { createSessionHandlers } from './session-handlers';
import { createMemberAttendanceHandlers } from './member-attendance-handlers';

function startDemo() {
  const fixtures = createSessionFixtures(Date.parse('2026-11-07T13:30:00+09:00'));
  const attendance = createAttendanceFixtures(fixtures);
  server.use(
    ...createSessionHandlers(apiBaseUrl, undefined, fixtures, attendance),
    ...createMemberAttendanceHandlers(apiBaseUrl, undefined, undefined, attendance),
  );
}

beforeEach(startDemo);

it.each(['LATE', 'EARLY_LEAVE', 'ABSENT'] as const)(
  '%s 사전 보고는 필수 사유와 함께 현재 세션에 접수한다',
  async (type) => {
    const result = await submit1({ body: { type, reason: '개인 사정' } });

    expect(result.data).toMatchObject({ sessionId: 39902, submittedAt: expect.any(String) });
  },
);

it('빈 사유 보고는 접수하지 않는다', async () => {
  const result = await submit1({
    body: { type: 'LATE', reason: ' ' },
    kyOptions: { throwHttpErrors: false },
  });

  expect(result.response?.status).toBe(400);
  expect(result.error).toMatchObject({ status: 400, body: { code: 'INVALID_ATTENDANCE_REPORT' } });
});

it('잘못된 코드·세션은 기록을 바꾸지 않고 정상 재입력만 내역에 반영한다', async () => {
  const { data: week } = await find4();
  expect(week?.session?.sessionId).toBe(39902);
  const before = (await find6()).data;
  const score = (await mine()).data;
  for (const [body, status, code] of [
    [{ sessionId: 39902, code: 1111 }, 400, 'INVALID_ATTENDANCE_CODE'],
    [{ sessionId: 42, code: 1234 }, 404, 'ATTENDANCE_SESSION_NOT_FOUND'],
  ] as const) {
    const result = await verify({ body, kyOptions: { throwHttpErrors: false } });
    expect(result.response?.status).toBe(status);
    expect(result.error).toMatchObject({ status, body: { code } });
    expect((await find6()).data).toEqual(before);
  }
  const result = await verify({ body: { sessionId: 39902, code: 1234 } });
  expect(result.data).toMatchObject({ verified: true, checkedInAt: expect.any(String) });
  const after = (await find6()).data;
  expect(before?.items.find(({ sessionId }) => sessionId === 39902)?.attendanceStatus).toBe(
    'UNDECIDED',
  );
  expect(after?.items.find(({ sessionId }) => sessionId === 39902)?.attendanceStatus).toBe(
    'PRESENT',
  );
  expect(after?.items).toHaveLength(2);
  expect(after?.summary).toEqual(before?.summary);
  expect((await mine()).data).toEqual(score);
});

it('재제출은 동일한 완료 시각을 반환하고 새 시연은 초기 상태로 시작한다', async () => {
  const body = { sessionId: 39902, code: 1234 };
  const first = (await verify({ body })).data;
  const history = (await find6()).data;
  expect((await verify({ body })).data).toEqual(first);
  expect((await find6()).data).toEqual(history);
  startDemo();
  expect((await find6()).data?.items.find(({ sessionId }) => sessionId === 39902)).toMatchObject({
    attendanceStatus: 'UNDECIDED',
  });
});

it('예정된 세션만 있으면 출석 요청을 거절하고 내역·집계를 비워 둔다', async () => {
  const fixtures = createUpcomingSessionFixtures(Date.parse('2026-11-09T12:00:00+09:00'));
  const attendance = createAttendanceFixtures(fixtures);
  server.use(
    ...createSessionHandlers(apiBaseUrl, undefined, fixtures, attendance),
    ...createMemberAttendanceHandlers(apiBaseUrl, undefined, undefined, attendance),
  );
  const result = await verify({
    body: { sessionId: 39901, code: 1234 },
    kyOptions: { throwHttpErrors: false },
  });
  expect(result.response?.status).toBe(409);
  expect(result.error).toMatchObject({ status: 409, body: { code: 'ATTENDANCE_UNAVAILABLE' } });
  expect((await find6()).data).toMatchObject({
    items: [],
    summary: { totalSessionCount: 3, startedSessionCount: 0 },
  });
  expect((await mine()).data?.attendanceCount).toBe(0);
});
