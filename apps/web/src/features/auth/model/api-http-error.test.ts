/** 실제 생성 mutation과 SDK에서 공통 HTTP 오류 계약 및 본문 단일 소비를 검증한다. */
import { ApiError, initializeApiErrorHandling } from '@yapp-plus/api';
import { client, renew, renewMutation } from '@yapp-plus/api/generated';
import { MutationObserver, QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';

const endpoint = `${apiBaseUrl}/api/auth/session-renewals`;
const input = { body: { refreshToken: 'test-token' }, retry: 0 };

it.each([
  [
    'JSON',
    '{"code":"AUTHENTICATION_FAILED","message":"server detail"}',
    { code: 'AUTHENTICATION_FAILED', message: 'server detail' },
  ],
  ['텍스트', 'upstream unavailable', 'upstream unavailable'],
  ['빈 본문', '', {}],
])('%s 오류의 상태·본문을 생성 mutation과 반환형 SDK 모두 보존한다', async (_, text, body) => {
  server.use(http.post(endpoint, () => new HttpResponse(text, { status: 403 })));
  initializeApiErrorHandling();
  initializeApiErrorHandling();
  const observer = vi.fn<(error: unknown) => unknown>((error) => error);
  const id = client.interceptors.error.use(observer);
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false, gcTime: 0 } },
  });
  try {
    const mutation = new MutationObserver(queryClient, renewMutation());
    await expect(mutation.mutate(input)).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      body,
      message: 'API 요청 실패 (HTTP 403)',
    });
    expect(observer).toHaveBeenCalledTimes(1);
    const result = await renew({ ...input, throwOnError: false });
    expect(result.response?.status).toBe(403);
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.error).toMatchObject({ status: 403, body });
    expect(observer).toHaveBeenCalledTimes(2);
  } finally {
    client.interceptors.error.eject(id);
    queryClient.clear();
  }
});

it('전송 실패와 이미 취소된 요청에 HTTP 상태를 만들지 않는다', async () => {
  server.use(http.post(endpoint, () => HttpResponse.error()));
  const network = await renew({ ...input, throwOnError: false });
  expect(network.error).not.toBeInstanceOf(ApiError);
  expect(network.error).toBeDefined();
  const controller = new AbortController();
  controller.abort();
  await expect(
    renew({ ...input, signal: controller.signal, throwOnError: true }),
  ).rejects.toMatchObject({ name: 'AbortError' });
});

it('성공 응답의 검증 예외를 HTTP 오류로 바꾸지 않는다', async () => {
  server.use(http.post(endpoint, () => HttpResponse.json({})));
  const validationError = new Error('invalid response');
  await expect(
    renew({
      ...input,
      throwOnError: true,
      responseValidator: () => Promise.reject(validationError),
    }),
  ).rejects.toBe(validationError);
});
