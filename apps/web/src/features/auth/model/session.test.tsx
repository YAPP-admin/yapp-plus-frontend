import { QueryClient, QueryObserver, focusManager, onlineManager } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { nativeSessionQueryKey, nativeSessionQueryOptions } from './session';

const bridge = vi.hoisted(() => ({
  getNativeSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
vi.mock('./native-auth', () => bridge);
let client: QueryClient;
let observer: QueryObserver<AuthResult> | undefined;
let unsubscribe: (() => void) | undefined;
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
  observer = undefined;
  client.unmount();
  client.clear();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  vi.useRealTimers();
});
const observe = () => {
  observer = new QueryObserver(client, nativeSessionQueryOptions(true));
  unsubscribe = observer.subscribe(() => {});
  return vi.advanceTimersByTimeAsync(0);
};

it.each(['undefined', 'timeout'])(
  '%s 뒤에는 자동 재조회하지 않고 수동 재시도만 실행한다',
  async (failure) => {
    if (failure === 'timeout') {
      bridge.getNativeSession.mockRejectedValueOnce(new Error('timeout'));
    } else {
      bridge.getNativeSession.mockResolvedValueOnce(undefined);
    }
    bridge.getNativeSession.mockResolvedValue({ status: 'SIGNED_OUT' });
    await observe();
    expect(client.getQueryData(nativeSessionQueryKey)).toMatchObject({ status: 'UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(20000);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
    await observer?.refetch();
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual({ status: 'SIGNED_OUT' });
    expect(bridge.getNativeSession).toHaveBeenCalledTimes(2);
  },
);

it('정상 세션은 복귀와 온라인 전환에도 다시 조회하지 않는다', async () => {
  bridge.getNativeSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  await observe();
  focusManager.setFocused(false);
  focusManager.setFocused(true);
  onlineManager.setOnline(false);
  onlineManager.setOnline(true);
  await vi.advanceTimersByTimeAsync(10000);
  expect(bridge.getNativeSession).toHaveBeenCalledTimes(1);
});
