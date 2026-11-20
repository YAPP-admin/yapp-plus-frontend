/** 실제 브리지의 알림 초기 상태와 ack 입력 검증을 SDK 없이 검증합니다. */
import { describe, expect, it, vi } from 'vitest';
import type { AppBridgeState } from '@yapp-plus/app-bridge';
import { nativeAppBridge, pushNotificationState } from '../bridge';

vi.mock('@webview-bridge/react-native', () => ({
  bridge: (
    create: (context: {
      get: () => AppBridgeState;
      set: (value: Partial<AppBridgeState>) => void;
    }) => AppBridgeState,
  ) => {
    let state: AppBridgeState;
    const setState = (value: Partial<AppBridgeState>) => {
      state = { ...state, ...value };
    };
    state = create({ get: () => state, set: setState });
    return { getState: () => state, setState };
  },
  createWebView: () => ({ WebView: () => null }),
}));
vi.mock('react-native-safe-area-context', () => ({ initialWindowMetrics: null }));
vi.mock('../auth/native-auth-runtime', () => ({ authActions: {} }));
vi.mock('../location/native-location-runtime', () => ({ locationActions: {} }));
vi.mock('../photo/native-photo-runtime', () => ({ photoActions: {} }));
vi.mock('./native-registration-sync', () => ({ notificationSettingsActions: {} }));

describe('알림 브리지 처리 확인', () => {
  it('초기 상태는 대기 없음·revision 0이다', () => {
    expect(nativeAppBridge.getState()).toMatchObject({
      notificationOpen: null,
      notificationRevision: 0,
    });
  });

  it('잘못된 입력과 오래된 ack는 새 대기를 지우지 않고 일치하는 ack만 반영한다', async () => {
    pushNotificationState.setPendingNotificationOpenIfNew({ messageId: 'first' });
    const first = pushNotificationState.getNotificationBridgeState().notificationOpen;
    pushNotificationState.setPendingNotificationOpenIfNew({ messageId: 'second' });
    nativeAppBridge.setState(pushNotificationState.getNotificationBridgeState());
    const current = nativeAppBridge.getState().notificationOpen;
    if (!first || !current) {
      throw new Error('탭 대기 이벤트가 필요합니다.');
    }
    await nativeAppBridge.getState().acknowledgeNotificationOpen({ eventId: '' });
    await nativeAppBridge.getState().acknowledgeNotificationOpen({ eventId: first.eventId });
    expect(nativeAppBridge.getState().notificationOpen).toEqual(current);
    await nativeAppBridge.getState().acknowledgeNotificationOpen({ eventId: current.eventId });
    expect(nativeAppBridge.getState().notificationOpen).toBeNull();
    expect(pushNotificationState.getNotificationBridgeState().notificationOpen).toBeNull();
  });
});
