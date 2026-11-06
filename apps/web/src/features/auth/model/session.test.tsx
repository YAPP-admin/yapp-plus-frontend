import { QueryClient, QueryObserver, focusManager, onlineManager } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { nativeSessionQueryKey, nativeSessionQueryOptions } from './session';

const bridge = vi.hoisted(() => ({
  getNativeSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
vi.mock('./native-auth', () => bridge);
let client: QueryClient;
let unsubscribe: () => void;
beforeEach(() => {
  vi.useFakeTimers();
  client = new QueryClient();
  client.mount();
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
  bridge.getNativeSession.mockReset();
});
afterEach(() => {
  unsubscribe?.();
  client.unmount();
  client.clear();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  vi.useRealTimers();
});
const observe = () => {
  unsubscribe = new QueryObserver(client, nativeSessionQueryOptions(true)).subscribe(() => {});
  return vi.advanceTimersByTimeAsync(0);
};

it.each(['undefined', 'timeout'])(
  '%s 뒤 5초 간격으로 복구하고 성공 뒤 재조회를 멈춘다',
  async (failure) => {
    if (failure === 'timeout') {
      bridge.getNativeSession.mockRejectedValueOnce(new Error('timeout'));
    } else {
      bridge.getNativeSession.mockResolvedValueOnce(undefined);
    }
    bridge.getNativeSession.mockResolvedValue({ status: 'SIGNED_OUT' });
    await observe();
    expect(client.getQueryData(nativeSessionQueryKey)).toMatchObject({ status: 'UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(4999);
    await client.fetchQuery(nativeSessionQueryOptions(true));
    expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
    await vi.advanceTimersByTimeAsync(20000);
    expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  },
);

it('미지원은 자동·복귀·수동 재조회로 반복 호출하지 않는다', async () => {
  bridge.getNativeSession.mockResolvedValue({
    status: 'UNAVAILABLE',
    code: 'UNSUPPORTED',
    retryable: false,
  });
  await observe();
  await vi.advanceTimersByTimeAsync(10000);
  focusManager.setFocused(false);
  focusManager.setFocused(true);
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  await client.fetchQuery(nativeSessionQueryOptions(true));
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
});

it('숨김 중 재조회하지 않고 복귀·온라인·수동 요청을 하나의 진행 요청으로 모은다', async () => {
  bridge.getNativeSession.mockResolvedValueOnce(undefined);
  await observe();
  focusManager.setFocused(false);
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  await vi.advanceTimersByTimeAsync(10000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
  let resolve!: (value: AuthResult) => void;
  bridge.getNativeSession.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  focusManager.setFocused(true);
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  const manual = client.fetchQuery(nativeSessionQueryOptions(true));
  await vi.advanceTimersByTimeAsync(10000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  resolve({ status: 'SIGNED_OUT' });
  await manual;
  unsubscribe();
  await vi.advanceTimersByTimeAsync(10000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
});

it('진행 요청의 실패 완료부터 다시 5초를 기다리고 unmount 후 자동 조회를 멈춘다', async () => {
  let resolve!: (value: undefined) => void;
  bridge.getNativeSession.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await observe();
  await vi.advanceTimersByTimeAsync(12000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
  resolve(undefined);
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(4999);
  focusManager.setFocused(false);
  focusManager.setFocused(true);
  await client.fetchQuery(nativeSessionQueryOptions(true));
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  unsubscribe();
  await vi.advanceTimersByTimeAsync(10000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
});

it('정상 세션도 focus 복귀 시 확인하고 진행 요청은 공유한다', async () => {
  const signedIn: AuthResult = {
    status: 'SIGNED_IN',
    session: {
      userId: 1,
      sessionId: 'session-1',
      tokenVersion: 1,
      accessToken: 'test',
      expiresAt: 9999999999,
    },
  };
  bridge.getNativeSession.mockResolvedValueOnce(signedIn);
  await observe();
  let resolve!: (result: AuthResult) => void;
  bridge.getNativeSession.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  focusManager.setFocused(false);
  focusManager.setFocused(true);
  await vi.advanceTimersByTimeAsync(0);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  await vi.advanceTimersByTimeAsync(0);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  resolve({ status: 'SIGNED_OUT' });
  await vi.advanceTimersByTimeAsync(0);
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
});

it.each(['AUTHENTICATING', 'SIGNUP_REQUIRED'] as const)(
  '%s에서는 focus가 인증 흐름을 덮어쓰는 조회를 시작하지 않는다',
  async (status) => {
    const result: AuthResult =
      status === 'AUTHENTICATING' ? { status } : { status, expiresAt: 9999999999 };
    client.setQueryData(nativeSessionQueryKey, result);
    await observe();
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(bridge.getNativeSession).not.toHaveBeenCalled();
  },
);
