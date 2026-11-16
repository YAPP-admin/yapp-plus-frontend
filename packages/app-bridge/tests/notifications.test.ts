/** 웹 공개 진입점의 미지원 처리·입력과 응답 검증을 확인합니다. */
import { afterEach, expect, it, vi } from 'vitest';
import {
  getNotificationSettings,
  setNotificationEnabled,
  requestNotificationPermission,
} from '../src/web';
import { notificationSettingsResultSchema, setNotificationEnabledInputSchema } from '../src';

const native = vi.hoisted(() => ({
  isNativeMethodAvailable: vi.fn<(name: string) => boolean>(),
  getNotificationSettings: vi.fn<() => Promise<unknown>>(),
  setNotificationEnabled: vi.fn<(input: { enabled: boolean }) => Promise<unknown>>(),
  requestNotificationPermission: vi.fn<() => Promise<unknown>>(),
}));
vi.mock('@webview-bridge/web', () => ({ linkBridge: () => native }));
const inApp = () => {
  vi.stubGlobal('window', { ReactNativeWebView: {} });
  native.isNativeMethodAvailable.mockReturnValue(true);
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it.each([undefined, {}])(
  '브라우저·SSR에서는 브리지를 호출하지 않는다 (%j)',
  async (windowValue) => {
    vi.stubGlobal('window', windowValue);
    expect(await getNotificationSettings()).toMatchObject({ code: 'UNSUPPORTED' });
    expect(native.getNotificationSettings).not.toHaveBeenCalled();
  },
);
it('구버전 앱은 메서드가 없으면 RPC를 시작하지 않는다', async () => {
  inApp();
  native.isNativeMethodAvailable.mockReturnValue(false);
  expect(await setNotificationEnabled({ enabled: true })).toMatchObject({ code: 'UNSUPPORTED' });
  expect(native.setNotificationEnabled).not.toHaveBeenCalled();
});
it('설정 응답의 토큰 등 계약 외 필드는 전달하지 않는다', async () => {
  inApp();
  native.getNotificationSettings.mockResolvedValue({
    status: 'SUCCESS',
    enabled: false,
    permission: 'provisional',
    token: 'fixture',
  });
  expect(await getNotificationSettings()).toEqual({
    status: 'SUCCESS',
    enabled: false,
    permission: 'provisional',
  });
});
it('변경 입력과 권한 전용 결과를 각각 전달한다', async () => {
  inApp();
  native.setNotificationEnabled.mockResolvedValue({
    status: 'SUCCESS',
    enabled: false,
    permission: 'denied',
  });
  native.requestNotificationPermission.mockResolvedValue({
    status: 'SUCCESS',
    permission: 'authorized',
  });
  expect(await setNotificationEnabled({ enabled: false })).toMatchObject({ enabled: false });
  expect(native.setNotificationEnabled).toHaveBeenCalledExactlyOnceWith({ enabled: false });
  expect(await requestNotificationPermission()).toEqual({
    status: 'SUCCESS',
    permission: 'authorized',
  });
});
it('잘못된 응답과 전송 실패를 구분한다', async () => {
  inApp();
  native.getNotificationSettings.mockResolvedValue(undefined);
  expect(await getNotificationSettings()).toMatchObject({ code: 'INVALID_RESPONSE' });
  native.getNotificationSettings.mockRejectedValue(new Error('network'));
  expect(await getNotificationSettings()).toMatchObject({ code: 'NETWORK', retryable: true });
});
it.each([{}, { enabled: 'true' }, { enabled: 1 }])('boolean 이외 입력 %j를 거부한다', (input) => {
  expect(setNotificationEnabledInputSchema.safeParse(input).success).toBe(false);
});
it('알 수 없는 OS 권한을 성공으로 받아들이지 않는다', () => {
  expect(
    notificationSettingsResultSchema.safeParse({
      status: 'SUCCESS',
      enabled: true,
      permission: 'unknown',
    }).success,
  ).toBe(false);
});
