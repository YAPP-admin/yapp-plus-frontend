import { ApiError } from '@yapp-plus/api';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { afterEach, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { toCreateSessionRequest } from './session-api-model';
import { createSessionMutationOptions, updateSessionMutationOptions } from './session-queries';

const CREATE_INPUT = {
  name: '정규 세션',
  date: '2026-11-21',
  startTime: '14:00:00',
  endTime: '18:00:00',
  type: 'offline',
  location: {
    roadAddress: '서울특별시 중구 세종대로 110',
    detailAddress: '예시 교육장',
    latitude: 37.5665,
    longitude: 126.978,
  },
} as const;
const CREATE_VARIABLES = {
  path: { generationId: 25 },
  body: toCreateSessionRequest(CREATE_INPUT),
};

function executeCreate(variables = CREATE_VARIABLES) {
  const queryClient = new QueryClient();
  return queryClient
    .getMutationCache()
    .build(queryClient, createSessionMutationOptions)
    .execute(variables);
}

function executeUpdateRequest() {
  const queryClient = new QueryClient();
  return queryClient
    .getMutationCache()
    .build(queryClient, updateSessionMutationOptions)
    .execute({
      path: { generationId: 25, sessionId: 101 },
      body: CREATE_VARIABLES.body,
    });
}

afterEach(() => {
  onlineManager.setOnline(true);
});

it('기수 경로와 유형별 전체 본문을 보내고 생성된 세션 ID를 반환한다', async () => {
  let requestedGenerationId = '';
  let requestedBody: unknown;
  server.use(
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions`,
      async ({ params, request }) => {
        requestedGenerationId = String(params.generationId);
        requestedBody = await request.json();
        return HttpResponse.json({ sessionId: 301 }, { status: 201 });
      },
    ),
  );

  await expect(executeCreate()).resolves.toEqual({ sessionId: 301 });
  expect(requestedGenerationId).toBe('25');
  expect(requestedBody).toEqual({
    name: '정규 세션',
    location: '서울특별시 중구 세종대로 110 예시 교육장',
    date: '2026-11-21',
    startTime: '14:00:00',
    endTime: '18:00:00',
    type: 'REGULAR',
    roadAddress: '서울특별시 중구 세종대로 110',
    detailAddress: '예시 교육장',
    latitude: 37.5665,
    longitude: 126.978,
  });
});

it.each([400, 401, 404, 409])('HTTP %i 실패를 자동 재시도하지 않는다', async (status) => {
  let requestCount = 0;
  server.use(
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      requestCount += 1;
      return HttpResponse.json({ code: 'PRIVATE_CODE', message: 'private' }, { status });
    }),
  );

  const error = await executeCreate().catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status });
  expect(requestCount).toBe(1);
});

it('기본 online 모드에서는 오프라인 요청을 보류하고 연결 뒤 한 번만 실행한다', async () => {
  let requestCount = 0;
  server.use(
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      requestCount += 1;
      return HttpResponse.json({ sessionId: 301 }, { status: 201 });
    }),
  );
  const queryClient = new QueryClient();
  queryClient.mount();
  onlineManager.setOnline(false);

  const result = queryClient
    .getMutationCache()
    .build(queryClient, createSessionMutationOptions)
    .execute(CREATE_VARIABLES);
  await Promise.resolve();
  expect(requestCount).toBe(0);

  onlineManager.setOnline(true);
  await expect(result).resolves.toEqual({ sessionId: 301 });
  expect(requestCount).toBe(1);
  queryClient.unmount();
});

it('수정할 세션 ID와 전체 본문을 보내고 204 응답을 완료로 처리한다', async () => {
  let requestedPath = '';
  let requestedBody: unknown;
  server.use(
    http.put(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      async ({ params, request }) => {
        requestedPath = `${String(params.generationId)}/${String(params.sessionId)}`;
        requestedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      },
    ),
  );

  await executeUpdateRequest();
  expect(requestedPath).toBe('25/101');
  expect(requestedBody).toEqual(CREATE_VARIABLES.body);
});

it.each([
  [404, 'SESSION_NOT_FOUND'],
  [409, 'SESSION_DATE_CONFLICT'],
  [409, 'SESSION_UPDATE_CONFLICT'],
] as const)('수정 HTTP %i %s 실패를 자동 재시도하지 않는다', async (status, code) => {
  let requestCount = 0;
  server.use(
    http.put(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, () => {
      requestCount += 1;
      return HttpResponse.json({ code, message: 'private' }, { status });
    }),
  );

  const error = await executeUpdateRequest().catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status, body: { code } });
  expect(requestCount).toBe(1);
});
