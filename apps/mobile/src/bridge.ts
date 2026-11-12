/** WebView RPC 입력을 검증하고 native 인증·safe-area 기능을 연결하는 모듈입니다. */

import {
  INITIAL_SAFE_AREA_INSETS,
  acknowledgeNotificationOpenInputSchema,
  normalizeSafeAreaInsets,
  completeSignupInputSchema,
  refreshSessionInputSchema,
  signInInputSchema,
  type AuthResult,
  type AppBridgeState,
  type SafeAreaInsets,
} from '@yapp-plus/app-bridge';
import { bridge, createWebView } from '@webview-bridge/react-native';
import { useEffect } from 'react';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { authActions } from './auth/native-auth-runtime';
import { locationActions } from './location/native-location-runtime';
import { PushNotificationState } from './notifications/push-notification-state';
import { notificationSettingsActions } from './notifications/native-registration-sync';
import { photoActions } from './photo/native-photo-runtime';

const initialSafeAreaInsets = normalizeSafeAreaInsets(
  initialWindowMetrics?.insets ?? INITIAL_SAFE_AREA_INSETS,
);

const invalidInput = (): Promise<AuthResult> =>
  Promise.resolve({
    status: 'ERROR',
    code: 'INVALID_INPUT',
    retryable: false,
  });

/** 브리지와 SDK가 공유하며 WebView 재마운트에도 보존하는 프로세스 범위 상태입니다. */
export const pushNotificationState = new PushNotificationState();

export const nativeAppBridge = bridge<AppBridgeState>(({ get, set }) => ({
  ...pushNotificationState.getNotificationBridgeState(),
  acknowledgeNotificationOpen: (input) => {
    const parsed = acknowledgeNotificationOpenInputSchema.safeParse(input);
    if (parsed.success) {
      pushNotificationState.acknowledgeNotificationOpen(parsed.data.eventId);
      set(pushNotificationState.getNotificationBridgeState());
    }
    return Promise.resolve();
  },
  safeAreaInsets: initialSafeAreaInsets,
  getSafeAreaInsets: () => Promise.resolve(get().safeAreaInsets),
  signIn: (input) => {
    const parsed = signInInputSchema.safeParse(input);
    return parsed.success ? authActions.signIn(parsed.data) : invalidInput();
  },
  completeSignup: (input) => {
    const parsed = completeSignupInputSchema.safeParse(input);
    return parsed.success ? authActions.completeSignup(parsed.data) : invalidInput();
  },
  getSession: () => authActions.getSession(),
  refreshSession: (input) => {
    const parsed = refreshSessionInputSchema.safeParse(input);
    return parsed.success ? authActions.refreshSession(parsed.data) : invalidInput();
  },
  signOut: () => authActions.signOut(),
  withdraw: () => authActions.withdraw(),
  getLocationPermission: () => locationActions.getLocationPermission(),
  requestCurrentLocation: () => locationActions.requestCurrentLocation(),
  openAppSettings: () => locationActions.openAppSettings(),
  getNotificationSettings: () => notificationSettingsActions.getNotificationSettings(),
  setNotificationEnabled: (input) => notificationSettingsActions.setNotificationEnabled(input),
  requestNotificationPermission: () => notificationSettingsActions.requestNotificationPermission(),
  pickAttendancePhoto: (input) => photoActions.pickAttendancePhoto(input),
}));

export const { WebView: BridgeWebView } = createWebView({
  bridge: nativeAppBridge,
  // 위치·인증 응답이 WebView 콘솔 전달 과정에 노출되지 않도록 비활성화한다.
  debug: false,
  responseTimeout: 180_000,
});

export const useSyncSafeAreaInsets = (insets: SafeAreaInsets): void => {
  const { top, right, bottom, left } = insets;

  useEffect(() => {
    nativeAppBridge.setState({
      safeAreaInsets: normalizeSafeAreaInsets({ top, right, bottom, left }),
    });
  }, [top, right, bottom, left]);
};
