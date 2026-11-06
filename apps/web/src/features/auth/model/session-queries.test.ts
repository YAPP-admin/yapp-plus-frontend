import {
  MutationObserver,
  QueryClient,
  QueryObserver,
  focusManager,
  isCancelledError,
} from '@tanstack/react-query';
import { find3Options, find4Options } from '@yapp-plus/api/generated';
import type { AuthResult, AuthSession } from '@yapp-plus/app-bridge';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { nativeAuthClientOptions } from './native-auth-client';
import { nativeSessionQueryKey } from './operations';
import { nativeSessionQueryOptions } from './session';
import {
  nativeSignInMutationOptions,
  nativeSignOutMutationOptions,
  nativeWithdrawMutationOptions,
} from './mutations';

const bridge = vi.hoisted(() => ({
  getNativeSession: vi.fn<() => Promise<AuthResult>>(),
  signInWithNative: vi.fn<() => Promise<AuthResult>>(),
  completeNativeSignup: vi.fn<() => Promise<AuthResult>>(),
  signOutNative: vi.fn<() => Promise<AuthResult>>(),
  withdrawNative: vi.fn<() => Promise<AuthResult>>(),
  refreshNativeSession: vi.fn<() => Promise<AuthResult>>(),
}));
vi.mock('./native-auth', () => bridge);
const first: AuthSession = {
  userId: 1,
  sessionId: 'one',
  tokenVersion: 1,
  accessToken: 'test-one',
  expiresAt: 9999999999,
};
let client: QueryClient;
beforeEach(async () => {
  vi.resetAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  bridge.signInWithNative.mockResolvedValue({ status: 'SIGNED_IN', session: first });
  await new MutationObserver(client, nativeSignInMutationOptions(client)).mutate({
    input: 'google',
  });
});
afterEach(() => client.clear());

it('홈의 401 갱신을 세션 cache에 반영하고 다음 일정 요청이 새 토큰을 사용한다', async () => {
  const tokens: (string | null)[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/*`, ({ request }) => {
      const token = request.headers.get('Authorization');
      tokens.push(token);
      return token === 'Bearer test-one'
        ? HttpResponse.json({ status: 401 }, { status: 401 })
        : HttpResponse.json({ account: 1 });
    }),
  );
  const renewed = { ...first, tokenVersion: 2, accessToken: 'test-renewed' };
  bridge.refreshNativeSession.mockResolvedValue({ status: 'SIGNED_IN', session: renewed });
  await client.fetchQuery(find3Options(nativeAuthClientOptions(first, client)));
  const current = client.getQueryData<AuthResult>(nativeSessionQueryKey);
  expect(current).toEqual({ status: 'SIGNED_IN', session: renewed });
  if (current?.status !== 'SIGNED_IN') {
    throw new Error('로그인 세션이 없습니다.');
  }
  await client.fetchQuery(find4Options(nativeAuthClientOptions(current.session, client)));
  expect(tokens).toEqual(['Bearer test-one', 'Bearer test-renewed', 'Bearer test-renewed']);
  expect(bridge.refreshNativeSession).toHaveBeenCalledTimes(1);
  expect(client.getQueryData(find3Options().queryKey)).toEqual({ account: 1 });
});

it.each(['logout', 'withdraw', 'account', 'resume'] as const)(
  '%s 완료 시 홈·일정 cache를 비우고 이전 401 갱신을 폐기한다',
  async (kind) => {
    server.use(
      http.get(`${apiBaseUrl}/api/*`, () => HttpResponse.json({ status: 401 }, { status: 401 })),
    );
    let started!: () => void;
    const start = new Promise<void>((resolve) => {
      started = resolve;
    });
    let finish!: (result: AuthResult) => void;
    const pending = new Promise<AuthResult>((resolve) => {
      finish = resolve;
    });
    bridge.refreshNativeSession.mockImplementation(() => {
      started();
      return pending;
    });
    const home = find3Options(nativeAuthClientOptions(first, client));
    const schedule = find4Options(nativeAuthClientOptions(first, client));
    client.setQueryData(schedule.queryKey, { generationId: 1, generationNumber: 1, sessions: [] });
    client.getMutationCache().build(client, { mutationKey: ['report'] });
    const oldRequest = client.fetchQuery(home).catch((error: unknown) => error);
    await start;
    let expected: AuthResult;
    if (kind === 'logout') {
      expected = { status: 'SIGNED_OUT' };
      bridge.signOutNative.mockResolvedValue(expected);
      await new MutationObserver(client, nativeSignOutMutationOptions(client)).mutate({
        input: undefined,
      });
    } else if (kind === 'withdraw') {
      expected = { status: 'WITHDRAWN' };
      bridge.withdrawNative.mockResolvedValue(expected);
      await new MutationObserver(client, nativeWithdrawMutationOptions(client)).mutate({
        input: undefined,
      });
    } else {
      expected = {
        status: 'SIGNED_IN',
        session: { ...first, userId: 2, sessionId: 'two', accessToken: 'test-two' },
      };
      if (kind === 'resume') {
        bridge.getNativeSession.mockResolvedValue(expected);
        client.mount();
        const unsubscribe = new QueryObserver(client, nativeSessionQueryOptions(true)).subscribe(
          () => {},
        );
        try {
          focusManager.setFocused(false);
          focusManager.setFocused(true);
          await vi.waitUntil(() => bridge.getNativeSession.mock.calls.length === 1);
          await client.fetchQuery(nativeSessionQueryOptions(true));
        } finally {
          unsubscribe();
          client.unmount();
          focusManager.setFocused(undefined);
        }
      } else {
        bridge.signInWithNative.mockResolvedValue(expected);
        await new MutationObserver(client, nativeSignInMutationOptions(client)).mutate({
          input: 'google',
        });
      }
    }
    expect(bridge.getNativeSession).toHaveBeenCalledTimes(kind === 'resume' ? 1 : 0);
    expect(isCancelledError(await oldRequest)).toBe(true);
    finish({ status: 'SIGNED_IN', session: { ...first, tokenVersion: 2 } });
    await pending;
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual(expected);
    expect(client.getQueryData(home.queryKey)).toBeUndefined();
    expect(client.getQueryData(schedule.queryKey)).toBeUndefined();
    expect(
      client
        .getMutationCache()
        .getAll()
        .filter((mutation) => mutation.options.mutationKey?.[0] !== 'native-auth'),
    ).toHaveLength(0);
  },
);

it('401 갱신이 로그아웃을 확정하면 세션과 일정 cache를 정리한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/*`, () => HttpResponse.json({ status: 401 }, { status: 401 })),
  );
  bridge.refreshNativeSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  client.setQueryData(find4Options().queryKey, {
    generationId: 1,
    generationNumber: 1,
    sessions: [],
  });
  const result = await client
    .fetchQuery(find3Options(nativeAuthClientOptions(first, client)))
    .catch((error: unknown) => error);
  expect(isCancelledError(result)).toBe(true);
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
  expect(client.getQueryData(find4Options().queryKey)).toBeUndefined();
});

it.each(['unavailable', 'other-account'] as const)(
  '401 갱신의 %s 결과는 세션과 기존 일정 cache를 변경하지 않는다',
  async (scenario) => {
    server.use(
      http.get(`${apiBaseUrl}/api/*`, () => HttpResponse.json({ status: 401 }, { status: 401 })),
    );
    const response: AuthResult =
      scenario === 'unavailable'
        ? { status: 'UNAVAILABLE', code: 'TIMEOUT', retryable: true }
        : { status: 'SIGNED_IN', session: { ...first, userId: 2, sessionId: 'other' } };
    bridge.refreshNativeSession.mockResolvedValue(response);
    const cached = { generationId: 1, generationNumber: 1, sessions: [] };
    client.setQueryData(find4Options().queryKey, cached);
    const result = await client
      .fetchQuery(find3Options(nativeAuthClientOptions(first, client)))
      .catch((error: unknown) => error);
    expect(result).toMatchObject({ status: 401 });
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual({
      status: 'SIGNED_IN',
      session: first,
    });
    expect(client.getQueryData(find4Options().queryKey)).toEqual(cached);
  },
);
