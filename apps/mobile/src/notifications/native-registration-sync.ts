/** Firebase가 구성된 iOS 빌드에서만 앱 범위 알림 동기화를 시작합니다. */
import { getApps } from '@react-native-firebase/app';
import { getId, getInstallations } from '@react-native-firebase/installations';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  hasPermission,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { AppState, Platform } from 'react-native';
import {
  notificationFailure,
  type NotificationPermission as PermissionStatus,
} from '@yapp-plus/app-bridge';
import { authActions, nativeSession } from '../auth/native-auth-runtime';
import {
  createNotificationApi,
  type NotificationApiInput,
  type NotificationApiResult,
} from './notification-api';
import { NotificationRegistration, type NotificationPermission } from './registration';
import { startNotificationRegistrationSync } from './registration-sync';
import { notificationStorage } from './storage';
import { createNotificationSettingsActions } from './settings';

const requestDevice = async (
  operation: 'registerDevice' | 'removeDevice',
  input: NotificationApiInput,
): Promise<NotificationApiResult> =>
  (await authActions.runSessionRequest((refreshSession) =>
    createNotificationApi({
      refreshSession,
      getSessionSnapshot: () => nativeSession.snapshot,
    })[operation](input),
  )) ?? { ok: false, code: 'CANCELLED' };

const registration = new NotificationRegistration(notificationStorage, {
  registerDevice: (input) => requestDevice('registerDevice', input),
  removeDevice: (input) => requestDevice('removeDevice', input),
});

const permission = (status: number): NotificationPermission => {
  if (status === AuthorizationStatus.NOT_DETERMINED) {
    return 'undetermined';
  }
  return status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL ||
    status === AuthorizationStatus.EPHEMERAL
    ? 'allowed'
    : 'blocked';
};

const permissionStatus = (status: number): PermissionStatus => {
  switch (status) {
    case AuthorizationStatus.NOT_DETERMINED:
      return 'notDetermined';
    case AuthorizationStatus.DENIED:
      return 'denied';
    case AuthorizationStatus.AUTHORIZED:
      return 'authorized';
    case AuthorizationStatus.PROVISIONAL:
      return 'provisional';
    case AuthorizationStatus.EPHEMERAL:
      return 'ephemeral';
    default:
      throw new Error('지원하지 않는 알림 권한 상태입니다.');
  }
};

const getFirebaseConfiguration = () => {
  if (Platform.OS !== 'ios') {
    return undefined;
  }
  const app = getApps().find((candidate) => candidate.name === '[DEFAULT]');
  const firebaseProjectId = app?.options.projectId;
  if (!app || !firebaseProjectId) {
    return undefined;
  }
  const messaging = getMessaging(app);
  return {
    firebaseProjectId,
    getInstallationId: () => getId(getInstallations(app)),
    getToken: () => getToken(messaging),
    // v27의 기존 iOS 권한 API를 사용합니다. 별도 권한 패키지 도입은 현재 범위에 없습니다.
    getPermission: async () => permission(await hasPermission(messaging)),
    requestPermission: async () => permission(await requestPermission(messaging)),
    readPermission: async () => permissionStatus(await hasPermission(messaging)),
    subscribeToken: (listener: () => void) => onTokenRefresh(messaging, listener),
  };
};

/** Firebase 미설정·비 iOS는 미지원으로 처리하고 등록 조율기 인스턴스를 자동 동기화와 공유합니다. */
export const notificationSettingsActions = createNotificationSettingsActions(
  async () => {
    const configuration = getFirebaseConfiguration();
    if (!configuration) {
      return notificationFailure('UNSUPPORTED');
    }
    if (nativeSession.isSigningOut) {
      return notificationFailure('BUSY');
    }
    const result = await authActions.getSession();
    if (result.status !== 'SIGNED_IN') {
      if (result.status === 'ERROR' || result.status === 'UNAVAILABLE') {
        if (result.code === 'NETWORK' || result.code === 'TIMEOUT') {
          return notificationFailure('NETWORK');
        }
        return notificationFailure(result.code === 'STORAGE' ? 'STORAGE' : 'SERVER');
      }
      return notificationFailure(result.status === 'CANCELLED' ? 'BUSY' : 'AUTH_REQUIRED');
    }
    const session = result.session;
    const installationId = await configuration.getInstallationId();
    return {
      readPermission: configuration.readPermission,
      input: {
        firebaseProjectId: configuration.firebaseProjectId,
        installationId,
        session,
        getToken: configuration.getToken,
        getPermission: configuration.getPermission,
        requestPermission: configuration.requestPermission,
        isSessionCurrent: () =>
          !nativeSession.isSigningOut &&
          nativeSession.snapshot?.userId === session.userId &&
          nativeSession.snapshot.sessionId === session.sessionId,
      },
    };
  },
  registration,
  notificationStorage,
);

/** 루트 effect가 정리 함수를 소유합니다. 설정 없는 로컬 빌드는 인증에 영향 없이 건너뜁니다. */
export const startNativeNotificationRegistrationSync = (): (() => void) => {
  const configuration = getFirebaseConfiguration();
  if (!configuration) {
    return () => undefined;
  }
  return startNotificationRegistrationSync({
    ...configuration,
    getSession: () => authActions.getSession(),
    getSessionSnapshot: () => nativeSession.snapshot,
    subscribeSession: (listener) => nativeSession.subscribe(listener),
    subscribeActive: (listener) => {
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          listener();
        }
      });
      return () => subscription.remove();
    },
    clearRegistrationCache: () => registration.clearRegistrationCache(),
    sync: (input) => registration.sync(input),
  });
};
