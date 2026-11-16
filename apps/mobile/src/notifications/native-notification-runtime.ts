/** Firebase 수신·탭 SDK를 앱 범위 상태와 브리지에 연결합니다. 화면 이동은 웹이 담당합니다. */
import { getApps } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { authActions, nativeSession } from '../auth/native-auth-runtime';
import { nativeAppBridge, pushNotificationState } from '../bridge';
import { createPushNotificationRuntime } from './notification-runtime';

let startRuntime: ReturnType<typeof createPushNotificationRuntime> | undefined;

/** 루트 effect가 구독 수명을 소유합니다. Firebase 미설정 빌드는 이벤트 연결을 생략합니다. */
export const startNativeNotificationRuntime = (): (() => void) => {
  const app =
    Platform.OS === 'ios' && getApps().find((candidate) => candidate.name === '[DEFAULT]');
  if (!app) {
    return () => undefined;
  }
  const messaging = getMessaging(app);
  startRuntime ??= createPushNotificationRuntime({
    state: pushNotificationState,
    publish: () => nativeAppBridge.setState(pushNotificationState.getNotificationBridgeState()),
    getSession: () => authActions.getSession(),
    captureGeneration: () => nativeSession.captureGeneration(),
    getSessionId: () => nativeSession.snapshot?.sessionId,
    subscribeSession: (listener) => nativeSession.subscribe(listener),
    subscribeReceived: (listener) => onMessage(messaging, listener),
    subscribeOpened: (listener) => onNotificationOpenedApp(messaging, listener),
    getInitialNotification: () => getInitialNotification(messaging),
  });
  return startRuntime();
};
