import {
  QueryClient,
  QueryClientProvider,
  MutationObserver,
  MutationCache,
} from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  nativeSignInMutationOptions,
  nativeSignupMutationOptions,
  nativeSignOutMutationOptions,
  nativeWithdrawMutationOptions,
  useNativeSignInMutation,
  type NativeAuthCallbacks,
} from './mutations';
import { nativeSessionQueryKey, nativeSessionQueryOptions } from './session';

const bridge = vi.hoisted(() => ({
  signInWithNative: vi.fn<() => Promise<AuthResult | undefined>>(),
  completeNativeSignup: vi.fn<() => Promise<AuthResult | undefined>>(),
  signOutNative: vi.fn<() => Promise<AuthResult | undefined>>(),
  withdrawNative: vi.fn<() => Promise<AuthResult | undefined>>(),
  getNativeSession: vi.fn<() => Promise<AuthResult | undefined>>(),
  isNativeWebView: () => true,
}));
vi.mock('./native-auth', () => bridge);
const signedIn = (tokenVersion = 1): AuthResult => ({
  status: 'SIGNED_IN',
  session: {
    userId: 7,
    sessionId: 'session',
    tokenVersion,
    accessToken: 'test',
    expiresAt: 999999,
  },
});
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const login = (qc: QueryClient, callbacks: NativeAuthCallbacks = {}) =>
  new MutationObserver(qc, nativeSignInMutationOptions(qc, callbacks)).mutate({ input: 'google' });
const logout = (qc: QueryClient, callbacks: NativeAuthCallbacks = {}) =>
  new MutationObserver(qc, nativeSignOutMutationOptions(qc, callbacks)).mutate({
    input: undefined,
  });
beforeEach(() => {
  vi.resetAllMocks();
  bridge.signOutNative.mockResolvedValue({ status: 'SIGNED_OUT' });
  bridge.signInWithNative.mockResolvedValue(signedIn());
});

it.each([
  ['로그인', '성공'],
  ['로그인', '실패'],
  ['가입', '성공'],
] as const)('logout 뒤 이전 %s %s는 cache와 callback에 적용하지 않는다', async (kind, outcome) => {
  const qc = client();
  const pending = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  const request = kind === '로그인' ? bridge.signInWithNative : bridge.completeNativeSignup;
  request.mockReturnValueOnce(pending.promise);
  const callbacks = { onSignedIn: notify, onFailure: notify };
  const old = (
    kind === '로그인'
      ? login(qc, callbacks)
      : new MutationObserver(qc, nativeSignupMutationOptions(qc, callbacks)).mutate({
          input: { name: '테스트', phoneNumber: '01012345678' },
        })
  ).catch(() => undefined);
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  await logout(qc);
  if (outcome === '성공') {
    pending.resolve(signedIn());
  } else {
    pending.reject(new Error('late'));
  }
  await old;
  expect(notify).not.toHaveBeenCalled();
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
});

it('logout보다 새 로그인이 먼저 완료되면 이전 logout callback을 차단한다', async () => {
  const qc = client();
  const pending = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  bridge.signOutNative.mockReturnValueOnce(pending.promise);
  const old = logout(qc, { onSignedOut: notify });
  await vi.waitFor(() => expect(bridge.signOutNative).toHaveBeenCalledTimes(1));
  await login(qc);
  pending.resolve({ status: 'SIGNED_OUT' });
  await old;
  expect(notify).not.toHaveBeenCalled();
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(signedIn());
});

it('응답 완료 뒤 callback 실행이 지연된 사이 logout해도 이전 결과를 폐기한다', async () => {
  const gate = deferred<void>();
  const reached = vi.fn<() => void>();
  const qc = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: async (_data, variables) => {
        if (
          typeof variables === 'object' &&
          variables !== null &&
          'input' in variables &&
          variables.input === 'google'
        ) {
          reached();
          await gate.promise;
        }
      },
    }),
  });
  const notify = vi.fn<() => void>();
  const old = login(qc, { onSignedIn: notify });
  await vi.waitFor(() => expect(reached).toHaveBeenCalled());
  await logout(qc);
  gate.resolve();
  await old;
  expect(notify).not.toHaveBeenCalled();
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
});

it.each(['logout', 'login'] as const)(
  '%s 확정 뒤 이전 복구 조회가 상태를 덮지 않는다',
  async (action) => {
    const qc = client();
    const pending = deferred<AuthResult>();
    bridge.getNativeSession.mockReturnValueOnce(pending.promise);
    const old = qc.fetchQuery(nativeSessionQueryOptions(true)).catch(() => undefined);
    const result = action === 'logout' ? await logout(qc) : await login(qc);
    pending.resolve(action === 'logout' ? signedIn() : { status: 'SIGNED_OUT' });
    await old;
    expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(result);
  },
);

it('로그인 도중 시작된 조회도 확정 결과를 덮지 않는다', async () => {
  const qc = client();
  const response = deferred<AuthResult>();
  const read = deferred<AuthResult>();
  bridge.signInWithNative.mockReturnValueOnce(response.promise);
  const pending = login(qc);
  await vi.waitFor(() => expect(bridge.signInWithNative).toHaveBeenCalled());
  bridge.getNativeSession.mockReturnValueOnce(read.promise);
  const query = qc.fetchQuery(nativeSessionQueryOptions(true)).catch(() => undefined);
  response.resolve(signedIn());
  await pending;
  read.resolve({ status: 'SIGNED_OUT' });
  await query;
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(signedIn());
});

it('중복 인증을 거절해도 첫 요청은 유지한다', async () => {
  const qc = client();
  const response = deferred<AuthResult>();
  bridge.signInWithNative.mockReturnValueOnce(response.promise);
  const notify = vi.fn<() => void>();
  const first = login(qc, { onSignedIn: notify });
  await vi.waitFor(() => expect(bridge.signInWithNative).toHaveBeenCalled());
  await expect(login(qc)).rejects.toThrow('인증이 진행 중');
  response.resolve(signedIn());
  await first;
  expect(notify).toHaveBeenCalledTimes(1);
  expect(bridge.signInWithNative).toHaveBeenCalledTimes(1);
});

it('logout 진행은 로딩이고 실패는 조회 불가이며 onFailure를 호출한다', async () => {
  const qc = client();
  qc.setQueryData(nativeSessionQueryKey, signedIn());
  const response = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  bridge.signOutNative.mockReturnValueOnce(response.promise);
  const pending = logout(qc, { onFailure: notify }).catch(() => undefined);
  await vi.waitFor(() => expect(bridge.signOutNative).toHaveBeenCalled());
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'AUTHENTICATING' });
  response.reject(new Error('timeout'));
  await pending;
  expect(notify).toHaveBeenCalledTimes(1);
  expect(qc.getQueryData(nativeSessionQueryKey)).toMatchObject({
    status: 'UNAVAILABLE',
    code: 'OUTCOME_UNKNOWN',
  });
});

it('취소는 callback이나 현재 세션을 변경하지 않는다', async () => {
  const qc = client();
  qc.setQueryData(nativeSessionQueryKey, signedIn());
  const notify = vi.fn<() => void>();
  bridge.withdrawNative.mockResolvedValue({ status: 'CANCELLED' });
  await new MutationObserver(
    qc,
    nativeWithdrawMutationOptions(qc, { onFailure: notify, onWithdrawn: notify }),
  ).mutate({ input: undefined });
  expect(notify).not.toHaveBeenCalled();
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(signedIn());
});

it('다른 QueryClient의 작업은 서로 무효화하지 않는다', async () => {
  const qc = client();
  const response = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  bridge.signInWithNative.mockReturnValueOnce(response.promise);
  const pending = login(qc, { onSignedIn: notify });
  await logout(client());
  response.resolve(signedIn());
  await pending;
  expect(notify).toHaveBeenCalledTimes(1);
});

it('unmount 후 성공은 cache에만 반영하고 화면 callback은 호출하지 않는다', async () => {
  const qc = client();
  const response = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  bridge.signInWithNative.mockReturnValueOnce(response.promise);
  const { result, unmount } = renderHook(() => useNativeSignInMutation({ onSignedIn: notify }), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children),
  });
  act(() => result.current.mutate('google'));
  await vi.waitFor(() => expect(bridge.signInWithNative).toHaveBeenCalled());
  unmount();
  response.resolve(signedIn());
  await vi.waitFor(() => expect(qc.isMutating()).toBe(0));
  expect(notify).not.toHaveBeenCalled();
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(signedIn());
});

it('onMutate 이후 무효화된 작업은 RPC를 시작하지 않는다', async () => {
  const qc = client();
  const gate = deferred<void>();
  const options = nativeSignInMutationOptions(qc);
  const started = vi.fn<() => void>();
  const mutation = new MutationObserver(qc, {
    ...options,
    onMutate: async (variables, context) => {
      const operation = await options.onMutate?.(variables, context);
      if (!operation) {
        throw new Error('인증 작업 문맥이 필요합니다');
      }
      started();
      await gate.promise;
      return operation;
    },
  });
  const pending = mutation.mutate({ input: 'google' });
  await vi.waitFor(() => expect(started).toHaveBeenCalled());
  await logout(qc);
  gate.resolve();
  await pending;
  expect(bridge.signInWithNative).not.toHaveBeenCalled();
});

it('로그아웃 후 연속 로그인은 최신 호출의 화면 callback만 실행한다', async () => {
  const qc = client();
  const first = deferred<AuthResult>();
  const second = deferred<AuthResult>();
  const notify = vi.fn<() => void>();
  bridge.signInWithNative.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useNativeSignInMutation({ onSignedIn: notify }), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children),
  });

  act(() => result.current.mutate('google'));
  await vi.waitFor(() => expect(bridge.signInWithNative).toHaveBeenCalledTimes(1));
  await logout(qc);
  act(() => result.current.mutate('google'));
  await vi.waitFor(() => expect(bridge.signInWithNative).toHaveBeenCalledTimes(2));

  await act(async () => {
    second.resolve(signedIn());
    await vi.waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    first.resolve(signedIn());
    await vi.waitFor(() => expect(qc.isMutating()).toBe(0));
  });
  expect(notify).toHaveBeenCalledTimes(1);
  expect(qc.getQueryData(nativeSessionQueryKey)).toEqual(signedIn());
});
