import { afterEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { getNativeSession } from './native-auth';

const bridge = vi.hoisted(() => ({
  isWebViewBridgeAvailable: false,
  isNativeMethodAvailable: vi.fn<(method: string) => boolean>(() => false),
  getSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
vi.mock('@yapp-plus/app-bridge/web', () => ({ getAppBridge: () => bridge }));
afterEach(() => {
  vi.restoreAllMocks();
  bridge.isWebViewBridgeAvailable = false;
  bridge.isNativeMethodAvailable.mockReturnValue(false);
  bridge.getSession.mockReset();
});

it('일반 브라우저에서는 native RPC를 호출하지 않는다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Browser');
  expect(await getNativeSession()).toBeUndefined();
  expect(bridge.getSession).not.toHaveBeenCalled();
});

it('미준비와 미지원을 구분하고 메서드가 준비된 뒤에만 호출한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  expect(await getNativeSession()).toEqual({
    status: 'UNAVAILABLE',
    code: 'OUTCOME_UNKNOWN',
    retryable: true,
  });
  expect(bridge.getSession).not.toHaveBeenCalled();
  bridge.isWebViewBridgeAvailable = true;
  expect(await getNativeSession()).toEqual({
    status: 'UNAVAILABLE',
    code: 'UNSUPPORTED',
    retryable: false,
  });
  expect(bridge.getSession).not.toHaveBeenCalled();
  bridge.isNativeMethodAvailable.mockReturnValue(true);
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  expect(await getNativeSession()).toEqual({ status: 'SIGNED_OUT' });
  expect(bridge.isNativeMethodAvailable).toHaveBeenCalledWith('getSession');
  expect(bridge.getSession).toHaveBeenCalledTimes(1);
});
