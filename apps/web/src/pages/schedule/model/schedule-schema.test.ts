import { QueryClient } from '@tanstack/react-query';
import { find5Options } from '@yapp-plus/api/generated';
import { fakeCurrentGenerationSessionItemResponse } from '@yapp-plus/api/generated/faker';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { scheduleFixture } from '../../../mocks/session-handlers';
import { scheduleSchema } from './schedule-schema';

const session = {
  ...fakeCurrentGenerationSessionItemResponse(),
  date: '2026-11-07',
  startTime: '13:30',
  endTime: '18:00',
};
const options = find5Options({
  baseUrl: apiBaseUrl,
  responseValidator: (data) => scheduleSchema.parseAsync(data),
  retry: 0,
  kyOptions: { throwHttpErrors: false },
});

it('생성 queryOptions로 서버 순서와 null 장소를 그대로 받는다', async () => {
  const response = {
    ...scheduleFixture,
    sessions: [
      { ...session, sessionId: 2, location: null },
      { ...session, sessionId: 1 },
    ],
  };
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () => HttpResponse.json(response)),
  );
  expect(await new QueryClient().fetchQuery(options)).toEqual(response);
});

it('faker 응답과 빈 목록이 생성 스키마의 추가 검증을 통과한다', () => {
  expect(scheduleSchema.safeParse(scheduleFixture).success).toBe(true);
  expect(scheduleSchema.parse({ ...scheduleFixture, sessions: [] }).sessions).toEqual([]);
});

it.each([
  { date: '2026-02-29' },
  { startTime: '25:00' },
  { endTime: '12:00' },
  { sessionId: Number.MAX_SAFE_INTEGER + 1 },
  { type: 'UNKNOWN' },
])('잘못된 일정 %j를 Zod로 거부한다', async (change) => {
  const response = { ...scheduleFixture, sessions: [{ ...session, ...change }] };
  expect(scheduleSchema.safeParse(response).success).toBe(false);
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () => HttpResponse.json(response)),
  );
  const client = new QueryClient();
  await expect(client.fetchQuery(options)).rejects.toMatchObject({ name: 'ZodError' });
  expect(client.getQueryData(options.queryKey)).toBeUndefined();
});

it('재조회 오류는 기존 데이터를 지우지 않는다', async () => {
  const client = new QueryClient();
  await client.fetchQuery(options);
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () =>
      HttpResponse.json({ code: 'FAILED' }, { status: 500 }),
    ),
  );
  await expect(client.fetchQuery(options)).rejects.toEqual({ code: 'FAILED' });
  expect(client.getQueryData(options.queryKey)).toEqual(scheduleFixture);
});
