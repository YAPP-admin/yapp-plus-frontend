/** 실제 Stackflow에 브리지 상태를 공급해 푸시 탐색·중복·인증 대기를 검증합니다. */
import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from '@yapp-plus/ui';
import type * as BridgeWeb from '@yapp-plus/app-bridge/web';
import type * as AuthFeature from '@/features/auth';
import type { NotificationOpen } from '@yapp-plus/app-bridge';
import { Suspense } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAppQueryClient } from '@/app/providers';
import { alertsInfiniteQueryOptions } from '@/pages/alerts';
import { createStackflowApp } from './stack';

const native = vi.hoisted(() => ({
  phase: 'SIGNED_IN',
  supported: true,
  snapshot: {
    notificationOpen: null as NotificationOpen | null,
    notificationRevision: 0,
  },
  listeners: new Set<() => void>(),
  authListeners: new Set<() => void>(),
  ack: vi.fn<(input: { eventId: string }) => Promise<void>>(),
}));

vi.mock('@yapp-plus/app-bridge/web', async (importOriginal) => ({
  ...(await importOriginal<typeof BridgeWeb>()),
  getAppBridge: () => ({
    isNativeMethodAvailable: () => native.supported,
    store: {
      getState: () => native.snapshot,
      subscribe: (listener: () => void) => {
        native.listeners.add(listener);
        return () => native.listeners.delete(listener);
      },
    },
    acknowledgeNotificationOpen: native.ack,
  }),
}));

vi.mock('@/features/auth', async (importOriginal) => {
  const { useSyncExternalStore } = await import('react');
  return {
    ...(await importOriginal<typeof AuthFeature>()),
    useNativeAuthSession: () => {
      const phase = useSyncExternalStore(
        (listener) => {
          native.authListeners.add(listener);
          return () => native.authListeners.delete(listener);
        },
        () => native.phase,
      );
      return {
        isNative: true,
        phase,
        session: { userId: 1, sessionId: 'session-1' },
        apiOptions: {},
      };
    },
  };
});

const popstateListeners: EventListenerOrEventListenerObject[] = [];
const addWindowListener = window.addEventListener.bind(window);

beforeEach(() => {
  native.phase = 'SIGNED_IN';
  native.supported = true;
  native.snapshot = { notificationOpen: null, notificationRevision: 0 };
  native.listeners.clear();
  native.authListeners.clear();
  native.ack.mockReset().mockResolvedValue();
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'popstate' && listener) {
      popstateListeners.push(listener);
    }
    addWindowListener(type, listener, options);
  });
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  for (const listener of popstateListeners.splice(0)) {
    window.removeEventListener('popstate', listener);
  }
  vi.restoreAllMocks();
});

const publish = (notificationOpen: NotificationOpen | null, notificationRevision = 0) => {
  act(() => {
    native.snapshot = { notificationOpen, notificationRevision };
    for (const listener of native.listeners) {
      listener();
    }
  });
};

async function waitForNativeAuthSubscription() {
  await waitFor(() => expect(native.authListeners.size).toBeGreaterThan(0));
}

async function waitForNotificationSubscription() {
  await waitFor(() => expect(native.listeners.size).toBe(1));
}

async function renderStack({ waitForNotification = true }: { waitForNotification?: boolean } = {}) {
  const client = createAppQueryClient();
  const { Stack, actions } = createStackflowApp({ reducedMotion: true });
  const tree = () => (
    <QueryClientProvider client={client}>
      <SnackbarProvider>
        <Suspense fallback={null}>
          <Stack />
        </Suspense>
      </SnackbarProvider>
    </QueryClientProvider>
  );
  const view = render(tree());

  await waitForNativeAuthSubscription();
  if (waitForNotification) {
    await waitForNotificationSubscription();
  }

  return { ...view, actions, client };
}

it('수신만으로 이동하지 않고 탭은 알림함으로 이동한 뒤 ack한다', async () => {
  await renderStack();

  publish(null, 1);
  expect(window.location.pathname).toBe('/');
  expect(native.ack).not.toHaveBeenCalled();

  publish({ eventId: 'open-1', destination: { type: 'ALERTS' } }, 1);
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'open-1' }));
  expect(window.location.pathname).toBe('/alerts');
});

it('인증 복원 전 탭을 보존하고 준비 후 공지 상세로 이동한다', async () => {
  native.phase = 'LOADING';
  native.snapshot.notificationOpen = {
    eventId: 'cold',
    destination: { type: 'POST', postId: 1 },
  };
  await renderStack({ waitForNotification: false });
  expect(native.listeners.size).toBe(0);
  expect(native.ack).not.toHaveBeenCalled();

  act(() => {
    native.phase = 'SIGNED_IN';
    for (const listener of native.authListeners) {
      listener();
    }
  });
  await waitForNotificationSubscription();
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'cold' }));
  expect(window.location.pathname).toBe('/notices/1');
});

it('같은 대상의 새 탭은 중복 push 없이 ack하고 뒤로가기는 기존 부모로 돌아간다', async () => {
  const { actions } = await renderStack();
  publish({ eventId: 'first', destination: { type: 'ALERTS' } });
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'first' }));
  publish({ eventId: 'second', destination: { type: 'ALERTS' } });
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'second' }));
  publish(null);
  act(() => actions.pop({ animate: false }));
  await waitFor(() => expect(window.location.pathname).toBe('/'));
});

it('이전 ack가 대기 중이어도 새 탭을 이동하고 새 eventId로 확인한다', async () => {
  native.ack.mockImplementation(() => new Promise<void>(() => {}));
  await renderStack();
  publish({ eventId: 'first', destination: { type: 'ALERTS' } });
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'first' }));
  publish({ eventId: 'second', destination: { type: 'POST', postId: 1 } });
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'second' }));
  expect(window.location.pathname).toBe('/notices/1');
});

it('구버전 앱은 알림 메서드를 호출하거나 상태를 구독하지 않는다', async () => {
  native.supported = false;
  native.snapshot.notificationOpen = { eventId: 'old', destination: { type: 'ALERTS' } };
  await renderStack({ waitForNotification: false });
  expect(native.listeners.size).toBe(0);
  expect(native.ack).not.toHaveBeenCalled();
});

it('수신 revision은 숨겨진 알림 목록을 stale로 만들고 재진입할 때 갱신한다', async () => {
  const { client, actions } = await renderStack();
  const options = alertsInfiniteQueryOptions();
  await client.fetchInfiniteQuery(options);
  expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(false);

  publish(null, 1);
  await waitFor(() => expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(true));
  expect(window.location.pathname).toBe('/');

  await act(() => actions.push('Alerts', {}, { animate: false }));
  await waitFor(() => expect(client.getQueryState(options.queryKey)?.isInvalidated).toBe(false));
});

it('잘못된 이동 대상은 무시하고 로그아웃하면 브리지 구독을 해제한다', async () => {
  const view = await renderStack();
  publish({ eventId: 'invalid', destination: { type: 'POST', postId: -1 } });
  expect(native.ack).not.toHaveBeenCalled();
  expect(window.location.pathname).toBe('/');

  act(() => {
    native.phase = 'SIGNED_OUT';
    for (const listener of native.authListeners) {
      listener();
    }
  });
  expect(native.listeners.size).toBe(0);
  publish({ eventId: 'after-logout', destination: { type: 'ALERTS' } });
  expect(native.ack).not.toHaveBeenCalled();
  view.unmount();
});

it('로그인 경로의 콜드 스타트는 기존 Tabs 복원을 기다린 뒤 탭을 처리한다', async () => {
  window.history.replaceState({}, '', '/login');
  native.snapshot.notificationOpen = {
    eventId: 'login-cold',
    destination: { type: 'POST', postId: 1 },
  };
  const { actions } = await renderStack();
  await waitFor(() => expect(native.ack).toHaveBeenCalledWith({ eventId: 'login-cold' }));
  expect(window.location.pathname).toBe('/notices/1');
  publish(null);
  act(() => actions.pop({ animate: false }));
  await waitFor(() => expect(window.location.pathname).toBe('/'));
});
