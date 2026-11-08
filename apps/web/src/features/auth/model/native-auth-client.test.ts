import {
  detail2,
  detail2Options,
  find3,
  find4,
  find3Options,
  find4Options,
} from '@yapp-plus/api/generated';
import type { AuthResult, AuthSession } from '@yapp-plus/app-bridge';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { isCancelledError, QueryClient } from '@tanstack/react-query';
import { nativeAuthClientOptions } from './native-auth-client';
import { refreshNativeSession } from './native-auth';

vi.mock('./native-auth', () => ({ refreshNativeSession: vi.fn<typeof refreshNativeSession>() }));
const session: AuthSession = {
  userId: 1,
  sessionId: 'test-session',
  tokenVersion: 1,
  accessToken: 'test-old',
  expiresAt: 9999999999,
};
let controller: AbortController;
beforeEach(() => {
  vi.resetAllMocks();
  controller = new AbortController();
});

it.each([find3, find4])(
  '401에서 native 갱신 후 원래 SDK 조회만 한 번 재시도한다',
  async (request) => {
    const tokens: (string | null)[] = [];
    server.use(
      http.get(`${apiBaseUrl}/api/*`, ({ request: req }) => {
        tokens.push(req.headers.get('Authorization'));
        return tokens.length === 1
          ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json({ ok: true });
      }),
    );
    vi.mocked(refreshNativeSession).mockResolvedValue({
      status: 'SIGNED_IN',
      session: { ...session, tokenVersion: 2, accessToken: 'test-new' },
    });
    await expect(
      request({
        ...nativeAuthClientOptions(session),
        signal: controller.signal,
        throwOnError: true,
      }),
    ).resolves.toMatchObject({ data: { ok: true } });
    expect(tokens).toEqual(['Bearer test-old', 'Bearer test-new']);
    expect(refreshNativeSession).toHaveBeenCalledExactlyOnceWith({
      sessionId: session.sessionId,
      tokenVersion: 1,
    });
  },
);

it('공지 상세 GET도 401 갱신 후 새 토큰으로 한 번 재시도한다', async () => {
  const tokens: (string | null)[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/posts/2`, ({ request }) => {
      tokens.push(request.headers.get('Authorization'));
      return tokens.length === 1
        ? new HttpResponse(null, { status: 401 })
        : HttpResponse.json({ postId: 2 });
    }),
  );
  vi.mocked(refreshNativeSession).mockResolvedValue({
    status: 'SIGNED_IN',
    session: { ...session, tokenVersion: 2, accessToken: 'test-new' },
  });

  await expect(
    detail2({
      ...nativeAuthClientOptions(session),
      path: { postId: 2 },
      signal: controller.signal,
      throwOnError: true,
    }),
  ).resolves.toMatchObject({ data: { postId: 2 } });
  expect(tokens).toEqual(['Bearer test-old', 'Bearer test-new']);
});

it.each([401, 403, 500])('HTTP %i에서 재시도 상한을 지킨다', async (status) => {
  let count = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/*`, () => {
      count += 1;
      return HttpResponse.json({ status }, { status });
    }),
  );
  vi.mocked(refreshNativeSession).mockResolvedValue({
    status: 'SIGNED_IN',
    session: { ...session, tokenVersion: 2 },
  });
  await expect(
    find3({ ...nativeAuthClientOptions(session), signal: controller.signal, throwOnError: true }),
  ).rejects.toMatchObject({
    status,
  });
  expect(count).toBe(status === 401 ? 2 : 1);
  expect(refreshNativeSession).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
});

it.each(['account', 'cancel', 'older', 'signed-out', 'unavailable'] as const)(
  '%s 갱신 결과를 재전송하지 않는다',
  async (scenario) => {
    let count = 0;
    server.use(
      http.get(`${apiBaseUrl}/api/*`, () => {
        count += 1;
        return HttpResponse.json({ status: 401 }, { status: 401 });
      }),
    );
    vi.mocked(refreshNativeSession).mockImplementation(() => {
      if (scenario === 'cancel') {
        controller.abort();
      }
      if (scenario === 'signed-out') {
        return Promise.resolve({ status: 'SIGNED_OUT' });
      }
      if (scenario === 'unavailable') {
        return Promise.resolve(undefined);
      }
      return Promise.resolve({
        status: 'SIGNED_IN',
        session: {
          ...session,
          sessionId: scenario === 'account' ? 'other' : session.sessionId,
          tokenVersion: scenario === 'older' ? 0 : 2,
        },
      });
    });
    await expect(
      find3({ ...nativeAuthClientOptions(session), signal: controller.signal, throwOnError: true }),
    ).rejects.toMatchObject(scenario === 'cancel' ? { name: 'AbortError' } : { status: 401 });
    expect(count).toBe(1);
  },
);

it('이미 취소된 조회는 HTTP 요청이나 갱신을 시작하지 않는다', async () => {
  controller.abort();
  await expect(
    find3({ ...nativeAuthClientOptions(session), signal: controller.signal, throwOnError: true }),
  ).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(refreshNativeSession).not.toHaveBeenCalled();
});

it('생성 queryOptions가 401 갱신 후 응답을 성공 데이터로 저장한다', async () => {
  let count = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/*`, () =>
      ++count === 1
        ? HttpResponse.json({ status: 401 }, { status: 401 })
        : HttpResponse.json({ session: null }),
    ),
  );
  vi.mocked(refreshNativeSession).mockResolvedValue({
    status: 'SIGNED_IN',
    session: { ...session, tokenVersion: 2 },
  });
  const queryClient = new QueryClient();
  await expect(
    queryClient.fetchQuery({ ...find3Options(nativeAuthClientOptions(session)), retry: false }),
  ).resolves.toEqual({ session: null });
  expect(count).toBe(2);
});

it('네트워크 오류는 자동 재시도하거나 native 갱신하지 않는다', async () => {
  let count = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/*`, () => {
      count += 1;
      return HttpResponse.error();
    }),
  );
  await expect(
    find3({ ...nativeAuthClientOptions(session), throwOnError: true }),
  ).rejects.toBeInstanceOf(Error);
  expect(count).toBe(1);
  expect(refreshNativeSession).not.toHaveBeenCalled();
});

const sessionQueries = [
  {
    name: '홈',
    options: find3Options,
    fetch: (client: QueryClient, auth: AuthSession) =>
      client.fetchQuery(find3Options(nativeAuthClientOptions(auth))),
  },
  {
    name: '일정',
    options: find4Options,
    fetch: (client: QueryClient, auth: AuthSession) =>
      client.fetchQuery(find4Options(nativeAuthClientOptions(auth))),
  },
  {
    name: '공지 상세',
    options: (config: Parameters<typeof find3Options>[0]) =>
      detail2Options({ ...config, path: { postId: 2 } }),
    fetch: (client: QueryClient, auth: AuthSession) =>
      client.fetchQuery(detail2Options({ ...nativeAuthClientOptions(auth), path: { postId: 2 } })),
  },
];

// 인증 전환에서 clear를 호출한다는 전제의 조회 계약이며, 실제 mutation 연결 검증은 별도다.
it.each(sessionQueries)(
  '$name: 캐시 초기화 이후 이전 계정의 갱신 결과로 재요청하거나 새 계정 캐시를 덮어쓰지 않는다',
  async ({ options, fetch }) => {
    let startRefresh: () => void = vi.fn<() => void>();
    const refreshStarted = new Promise<void>((resolve) => {
      startRefresh = resolve;
    });
    let finishRefresh: (result: AuthResult) => void = vi.fn<(result: AuthResult) => void>();
    const refreshResult = new Promise<AuthResult>((resolve) => {
      finishRefresh = resolve;
    });
    const tokens: (string | null)[] = [];
    server.use(
      http.get(`${apiBaseUrl}/api/*`, ({ request }) => {
        const token = request.headers.get('Authorization');
        tokens.push(token);
        return token === 'Bearer test-old'
          ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json({ account: 'new' });
      }),
    );
    vi.mocked(refreshNativeSession).mockImplementation(() => {
      startRefresh();
      return refreshResult;
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const previous = fetch(client, session).catch((error: unknown) => error);
    await refreshStarted;
    client.clear();
    expect(isCancelledError(await previous)).toBe(true);

    const nextSession = {
      ...session,
      userId: 2,
      sessionId: 'new-session',
      accessToken: 'test-account-new',
    };
    const nextOptions = options(nativeAuthClientOptions(nextSession));
    await expect(fetch(client, nextSession)).resolves.toEqual({ account: 'new' });
    finishRefresh({
      status: 'SIGNED_IN',
      session: { ...session, tokenVersion: 2, accessToken: 'test-refreshed-old' },
    });
    await refreshResult;
    expect(tokens).toEqual(['Bearer test-old', 'Bearer test-account-new']);
    expect(client.getQueryData(nextOptions.queryKey)).toEqual({ account: 'new' });
    expect(refreshNativeSession).toHaveBeenCalledTimes(1);
    client.clear();
  },
);

it.each(sessionQueries)(
  '$name: 같은 세션의 새 토큰 옵션은 캐시를 유지하고 다음 조회부터 새 토큰을 사용한다',
  async ({ options, fetch }) => {
    const tokens: (string | null)[] = [];
    server.use(
      http.get(`${apiBaseUrl}/api/*`, ({ request }) => {
        tokens.push(request.headers.get('Authorization'));
        return HttpResponse.json({ revision: tokens.length });
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const initial = options(nativeAuthClientOptions(session));
    await fetch(client, session);
    const nextSession = { ...session, tokenVersion: 2, accessToken: 'test-new' };
    const renewed = options(nativeAuthClientOptions(nextSession));
    expect(renewed.queryKey).toEqual(initial.queryKey);
    expect(client.getQueryData(renewed.queryKey)).toEqual({ revision: 1 });
    await fetch(client, nextSession);
    expect(tokens).toEqual(['Bearer test-old', 'Bearer test-new']);
    expect(client.getQueryData(renewed.queryKey)).toEqual({ revision: 2 });
    expect(refreshNativeSession).not.toHaveBeenCalled();
    client.clear();
  },
);
