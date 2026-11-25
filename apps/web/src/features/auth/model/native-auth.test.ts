import { afterEach, expect, it, vi } from 'vitest';
import { getNativeSession } from './native-auth';

const bridge = vi.hoisted(() => ({
  getSession: vi.fn<() => Promise<unknown>>(),
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

it('구 앱 세션의 전환 값은 웹 수신 시 NONE으로 보정한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  const session = {
    accessToken: 'test',
    expiresAt: 123,
    userId: 1,
    sessionId: 's',
    tokenVersion: 1,
  };
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_IN', session });
  expect(await getNativeSession()).toEqual({
    status: 'SIGNED_IN',
    session,
    reviewTransition: 'NONE',
  });
});

it('잘못된 브리지 응답은 세션 없이 INVALID_RESPONSE로 반환한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  bridge.getSession.mockResolvedValue({
    status: 'REVIEW_REQUIRED',
    reviewStatus: 'APPROVED',
    userId: 1,
  });
  expect(await getNativeSession()).toEqual({
    status: 'ERROR',
    code: 'INVALID_RESPONSE',
    retryable: false,
  });
});
