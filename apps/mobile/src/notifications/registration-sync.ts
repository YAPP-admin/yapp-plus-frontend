/** 인증·앱 수명·FCM 토큰 변경을 기기 등록 조율기에 연결합니다. 푸시 수신·탐색은 담당하지 않습니다. */
import type { AuthResult } from '@yapp-plus/app-bridge';
import type { AuthRequestSession } from '../auth/authenticated-request';
import type {
  NotificationRegistrationInput,
  NotificationRegistrationResult,
  NotificationPermission,
} from './registration';

/** 네이티브 SDK와 인증을 연결하는 앱 수명 경계입니다. 구독은 반드시 해제 함수를 반환합니다. */
export type NotificationRuntimeDependencies = {
  firebaseProjectId: string;
  getInstallationId: () => Promise<string>;
  getToken: () => Promise<string>;
  getPermission: () => Promise<NotificationPermission>;
  requestPermission: () => Promise<NotificationPermission>;
  getSession: () => Promise<AuthResult>;
  getSessionSnapshot: () => AuthRequestSession | undefined;
  subscribeSession: (listener: () => void) => () => void;
  subscribeToken: (listener: () => void) => () => void;
  subscribeActive: (listener: () => void) => () => void;
  clearRegistrationCache: () => void;
  sync: (input: NotificationRegistrationInput) => Promise<NotificationRegistrationResult>;
};

/** 앱 루트에서 한 번 시작하고 반환된 정리 함수로 리스너와 대기 작업을 무효화합니다. */
export const startNotificationRegistrationSync = (
  dependencies: NotificationRuntimeDependencies,
): (() => void) => {
  let active = true;
  let observedSessionId = dependencies.getSessionSnapshot()?.sessionId;
  if (!observedSessionId) {
    dependencies.clearRegistrationCache();
  }

  const synchronize = async () => {
    if (!active) {
      return;
    }

    const result = await dependencies.getSession();
    if (!active || result.status !== 'SIGNED_IN') {
      return;
    }

    const session = result.session;
    const installationId = await dependencies.getInstallationId();
    await dependencies.sync({
      firebaseProjectId: dependencies.firebaseProjectId,
      installationId,
      session,
      getToken: dependencies.getToken,
      getPermission: dependencies.getPermission,
      requestPermission: dependencies.requestPermission,
      isSessionCurrent: () => {
        const current = dependencies.getSessionSnapshot();
        return (
          active && current?.sessionId === session.sessionId && current.userId === session.userId
        );
      },
    });
  };

  const schedule = () => {
    // 등록 조율기가 직렬화합니다. 자동 동기화 실패는 다음 이벤트에서 재시도합니다.
    void synchronize().catch(() => undefined);
  };

  const unsubscribeSession = dependencies.subscribeSession(() => {
    const sessionId = dependencies.getSessionSnapshot()?.sessionId;
    if (sessionId === observedSessionId) {
      return;
    }

    dependencies.clearRegistrationCache();
    observedSessionId = sessionId;
    if (sessionId) {
      schedule();
    }
  });
  const unsubscribeToken = dependencies.subscribeToken(schedule);
  const unsubscribeActive = dependencies.subscribeActive(schedule);

  schedule();

  return () => {
    active = false;
    unsubscribeSession();
    unsubscribeToken();
    unsubscribeActive();
  };
};
