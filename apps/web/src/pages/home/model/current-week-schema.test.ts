import { QueryClient } from '@tanstack/react-query';
import { find3Options } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { currentWeekFixture } from '../../../mocks/session-handlers';
import { currentWeekSchema } from './current-week-schema';

const options = find3Options({
  baseUrl: apiBaseUrl,
  responseValidator: (data) => currentWeekSchema.parseAsync(data),
  retry: 0,
});

it('생성 queryOptions로 faker의 주간 응답을 변환 없이 받는다', async () => {
  const scheduleRequest = vi.fn<() => void>();
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () => {
      scheduleRequest();
      return HttpResponse.error();
    }),
  );
  expect(await new QueryClient().fetchQuery(options)).toEqual(currentWeekFixture);
  expect(scheduleRequest).not.toHaveBeenCalled();
});

it('null 세션과 장소를 그대로 유지한다', async () => {
  expect(
    currentWeekSchema.parse({
      ...currentWeekFixture,
      session: { ...currentWeekFixture.session, location: null },
    }).session?.location,
  ).toBeNull();
  server.use(
    http.get(`${apiBaseUrl}/api/sessions/current-week`, () =>
      HttpResponse.json({ ...currentWeekFixture, session: null }),
    ),
  );
  expect(await new QueryClient().fetchQuery(options)).toMatchObject({ session: null });
});

it.each([
  { weekEndDate: '2026-11-01' },
  { weekStartDate: '2026-02-30' },
  { session: { ...currentWeekFixture.session, startTime: '12:99' } },
  { session: { ...currentWeekFixture.session, date: '2026-11-08' } },
  { session: { ...currentWeekFixture.session, sessionId: Number.MAX_SAFE_INTEGER + 1 } },
])('잘못된 주간 응답 %j를 Zod로 거부한다', async (change) => {
  const response = { ...currentWeekFixture, ...change };
  expect(currentWeekSchema.safeParse(response).success).toBe(false);
  server.use(
    http.get(`${apiBaseUrl}/api/sessions/current-week`, () => HttpResponse.json(response)),
  );
  const client = new QueryClient();
  await expect(client.fetchQuery(options)).rejects.toMatchObject({ name: 'ZodError' });
  expect(client.getQueryData(options.queryKey)).toBeUndefined();
});
