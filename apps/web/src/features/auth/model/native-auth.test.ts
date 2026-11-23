import { afterEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { getNativeSession } from './native-auth';

const bridge = vi.hoisted(() => ({
  getSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
vi.mock('@yapp-plus/app-bridge/web', () => ({ getAppBridge: () => bridge }));
afterEach(() => {
  vi.restoreAllMocks();
  bridge.getSession.mockReset();
});

it('일반 브라우저에서는 native RPC를 호출하지 않는다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Browser');
  expect(await getNativeSession()).toBeUndefined();
  expect(bridge.getSession).not.toHaveBeenCalled();
});

it('WebView에서는 capability 사전 검사 없이 세션 RPC 결과를 반환한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });

  expect(await getNativeSession()).toEqual({ status: 'SIGNED_OUT' });
  expect(bridge.getSession).toHaveBeenCalledTimes(1);
});

it('native fallback 결과는 세션 조회 흐름으로 전달한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  bridge.getSession.mockResolvedValue(undefined);

  expect(await getNativeSession()).toBeUndefined();
  expect(bridge.getSession).toHaveBeenCalledTimes(1);
});
