/** SDK 이벤트를 인증 수명과 연결합니다. 상태 보관과 브리지 전송은 주입된 경계를 사용합니다. */
import type { AuthResult } from '@yapp-plus/app-bridge';
import type { PushTargetInput } from './push-target';
import type { PushNotificationState } from './push-notification-state';

/** 인증 세대는 로그인·로그아웃 시 바뀌고 토큰 갱신·초기 세션 복원에서는 유지됩니다. */
export type PushNotificationRuntimeDependencies = {
  state: PushNotificationState;
  publish: () => void;
  getSession: () => Promise<AuthResult>;
  captureGeneration: () => number;
  getSessionId: () => string | undefined;
  subscribeSession: (listener: () => void) => () => void;
  subscribeReceived: (listener: (message: PushTargetInput) => void) => () => void;
  subscribeOpened: (listener: (message: PushTargetInput) => void) => () => void;
  getInitialNotification: () => Promise<PushTargetInput | null>;
};

type InitialNotification = {
  message: Promise<PushTargetInput | null>;
  generation: number;
  openVersion: number;
  consumed: boolean;
};

type NotificationOpenContext = Pick<
  PushNotificationRuntimeDependencies,
  'getSession' | 'state' | 'publish'
> & {
  isActive: () => boolean;
  isCurrentOpen: (generation: number, openVersion: number) => boolean;
};

const acceptOpen = async (
  message: PushTargetInput,
  generation: number,
  openVersion: number,
  context: NotificationOpenContext,
) => {
  const result = await context.getSession();
  if (!context.isCurrentOpen(generation, openVersion) || result.status !== 'SIGNED_IN') {
    return;
  }

  if (context.state.setPendingNotificationOpenIfNew(message)) {
    context.publish();
  }
};

const consumeInitialNotification = async (
  initial: InitialNotification,
  context: NotificationOpenContext,
) => {
  const message = await initial.message;
  if (!context.isActive() || initial.consumed) {
    return;
  }

  if (message) {
    await acceptOpen(message, initial.generation, initial.openVersion, context).catch(
      () => undefined,
    );
  }

  if (context.isActive()) {
    initial.consumed = true;
  }
};

/** 앱 범위에서 한 번 만들고 effect마다 시작·정리합니다. 초기 알림 조회는 재마운트에도 공유합니다. */
export const createPushNotificationRuntime = (
  dependencies: PushNotificationRuntimeDependencies,
) => {
  const { state, publish } = dependencies;
  let latestOpen = 0;
  let initial: InitialNotification | undefined;

  const getInitialNotificationOnce = () => {
    initial ??= {
      generation: dependencies.captureGeneration(),
      openVersion: latestOpen,
      message: dependencies.getInitialNotification().catch(() => null),
      consumed: false,
    };
    return initial;
  };

  return (): (() => void) => {
    let isRuntimeActive = true;
    let sessionId = dependencies.getSessionId();

    const openContext: NotificationOpenContext = {
      getSession: dependencies.getSession,
      state,
      publish,
      isActive: () => isRuntimeActive,
      isCurrentOpen: (generation, openVersion) =>
        isRuntimeActive &&
        generation === dependencies.captureGeneration() &&
        openVersion === latestOpen,
    };

    const handleSessionChange = () => {
      if (!isRuntimeActive) {
        return;
      }
      const nextSessionId = dependencies.getSessionId();
      if (sessionId && sessionId !== nextSessionId) {
        latestOpen += 1;
        state.clearPendingNotificationOpen();
        publish();
      }
      sessionId = nextSessionId;
    };

    const handlePushReceived = (message: PushTargetInput) => {
      if (isRuntimeActive && state.recordReceivedPushIfNew(message)) {
        publish();
      }
    };

    const handleNotificationOpened = (message: PushTargetInput) => {
      if (!isRuntimeActive) {
        return;
      }
      const openVersion = ++latestOpen;
      void acceptOpen(message, dependencies.captureGeneration(), openVersion, openContext).catch(
        () => {
          // 인증 복원 실패 시 기존 인증 화면이 복구를 담당합니다. 토큰·본문을 기록하지 않습니다.
        },
      );
    };

    const unsubscribeSession = dependencies.subscribeSession(handleSessionChange);
    const unsubscribeReceived = dependencies.subscribeReceived(handlePushReceived);
    const unsubscribeOpened = dependencies.subscribeOpened(handleNotificationOpened);

    void consumeInitialNotification(getInitialNotificationOnce(), openContext);

    return () => {
      isRuntimeActive = false;
      unsubscribeReceived();
      unsubscribeOpened();
      unsubscribeSession();
    };
  };
};
