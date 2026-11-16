/** 네이티브 알림 상태를 인증된 Stackflow 탐색과 알림함 재조회에 연결합니다. */
import type { Activity } from '@stackflow/core';
import { useFlow, useStack, type StackflowReactPlugin } from '@stackflow/react';
import { notificationOpenSchema, type NotificationDestination } from '@yapp-plus/app-bridge';
import { getAppBridge, type LinkedAppBridge } from '@yapp-plus/app-bridge/web';
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { useNativeAuthSession } from '@/features/auth';
import { usePushAlertsRefresh } from '@/pages/alerts';

/** 세션 복원이 끝난 뒤 구독하여 브리지 hydration 전 저장소에 연결하지 않습니다. */
export function notificationNavigationPlugin(): StackflowReactPlugin {
  return () => ({
    key: 'notification-navigation',
    wrapStack: ({ stack }) => (
      <>
        <NotificationNavigation />
        {stack.render()}
      </>
    ),
  });
}

function NotificationNavigation() {
  const { isNative, phase, session } = useNativeAuthSession();
  if (!isNative || phase !== 'SIGNED_IN' || !session) {
    return null;
  }

  const bridge = getAppBridge();
  if (!bridge.isNativeMethodAvailable('acknowledgeNotificationOpen')) {
    return null;
  }

  return (
    <NotificationConsumer
      key={JSON.stringify([session.userId, session.sessionId])}
      bridge={bridge}
    />
  );
}

function isNotificationDestination(
  activity: Activity | undefined,
  destination: NotificationDestination,
): boolean {
  return destination.type === 'POST'
    ? activity?.name === 'NoticeDetail' && activity.params.noticeId === String(destination.postId)
    : activity?.name === 'Alerts';
}

function pushNotificationDestination(
  flow: ReturnType<typeof useFlow>,
  destination: NotificationDestination,
): void {
  if (destination.type === 'POST') {
    flow.push('NoticeDetail', { noticeId: String(destination.postId) });
  } else {
    flow.push('Alerts', {});
  }
}

function acknowledgeOpenOnce(
  bridge: LinkedAppBridge,
  eventId: string,
  acknowledgedEventId: RefObject<string | undefined>,
): void {
  if (acknowledgedEventId.current === eventId) {
    return;
  }

  acknowledgedEventId.current = eventId;
  void bridge.acknowledgeNotificationOpen({ eventId }).catch(() => {
    // 이동은 완료됐습니다. 다음 상태 반영 또는 WebView 재마운트에서 다시 확인합니다.
    if (acknowledgedEventId.current === eventId) {
      acknowledgedEventId.current = undefined;
    }
  });
}

function NotificationConsumer({ bridge }: { bridge: LinkedAppBridge }) {
  const snapshot = useSyncExternalStore(bridge.store.subscribe, bridge.store.getState);
  const stack = useStack();
  const flow = useFlow();
  const top = stack.activities.find((activity) => activity.isTop);

  // 로그인 화면의 기존 인증 리다이렉트가 부모 Tabs를 준비하도록 기다립니다.
  const isNavigationReady =
    top?.transitionState === 'enter-done' &&
    stack.globalTransitionState === 'idle' &&
    top.name !== 'Login';

  const navigatedEventId = useRef<string | undefined>(undefined);
  const acknowledgedEventId = useRef<string | undefined>(undefined);

  usePushAlertsRefresh(snapshot.notificationRevision, top?.name === 'Alerts' && top.isActive);

  useEffect(() => {
    const parsed = notificationOpenSchema.safeParse(snapshot.notificationOpen);
    if (!parsed.success || !isNavigationReady) {
      return;
    }

    const { eventId, destination } = parsed.data;
    if (isNotificationDestination(top, destination)) {
      navigatedEventId.current = eventId;
      acknowledgeOpenOnce(bridge, eventId, acknowledgedEventId);
      return;
    }

    if (navigatedEventId.current === eventId) {
      return;
    }
    navigatedEventId.current = eventId;

    pushNotificationDestination(flow, destination);
  }, [snapshot.notificationOpen, isNavigationReady, top, flow, bridge]);

  return null;
}
