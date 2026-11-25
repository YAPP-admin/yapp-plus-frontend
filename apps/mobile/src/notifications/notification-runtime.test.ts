/** SDK를 대체해 수신·탭·초기 복원·세션 전환·effect 정리 경합을 검증합니다. */
import { describe, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { createPushNotificationRuntime } from './notification-runtime';
import { PushNotificationState } from './push-notification-state';
import type { PushTargetInput } from './push-target';

const session = {
  userId: 1,
  sessionId: 'session-1',
  tokenVersion: 1,
  accessToken: 'test',
  expiresAt: 9999999999999,
};
const signedIn: AuthResult = { status: 'SIGNED_IN', session, reviewTransition: 'NONE' };
const message = (id: string): PushTargetInput => ({
  messageId: id,
  data: { source: 'POST', postId: '2', postPushDeliveryId: id },
});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const flush = async () => {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
};

function setup() {
  const state = new PushNotificationState();
  const initial = deferred<PushTargetInput | null>();
  const current = { generation: 0, sessionId: 'session-1' as string | undefined };
  const listeners = {
    received: (_message: PushTargetInput) => {},
    opened: (_message: PushTargetInput) => {},
    session: () => {},
  };
  const unsubscribe = {
    received: vi.fn<() => void>(),
    opened: vi.fn<() => void>(),
    session: vi.fn<() => void>(),
  };
  const publish = vi.fn<() => void>();
  const getSession = vi.fn<() => Promise<AuthResult>>().mockResolvedValue(signedIn);
  const getInitialNotification = vi.fn<() => Promise<PushTargetInput | null>>(
    () => initial.promise,
  );
  const start = createPushNotificationRuntime({
    state,
    publish,
    getSession,
    getInitialNotification,
    captureGeneration: () => current.generation,
    getSessionId: () => current.sessionId,
    subscribeReceived: (listener) => {
      listeners.received = listener;
      return unsubscribe.received;
    },
    subscribeOpened: (listener) => {
      listeners.opened = listener;
      return unsubscribe.opened;
    },
    subscribeSession: (listener) => {
      listeners.session = listener;
      return unsubscribe.session;
    },
  });
  return {
    state,
    initial,
    current,
    listeners,
    unsubscribe,
    publish,
    getSession,
    getInitialNotification,
    start,
  };
}

describe('푸시 이벤트 런타임', () => {
  it('수신은 revision만 올리고 같은 발송의 탭은 별도로 대기시킨다', async () => {
    const input = setup();
    input.start();
    input.listeners.received(message('one'));
    input.listeners.received(message('one'));
    expect(input.state.getNotificationBridgeState()).toEqual({
      notificationOpen: null,
      notificationRevision: 1,
    });
    input.listeners.opened(message('one'));
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen?.destination).toEqual({
      type: 'POST',
      postId: 2,
    });
    input.listeners.opened(message('one'));
    await flush();
    expect(input.publish).toHaveBeenCalledTimes(2);
  });

  it('콜드 스타트에서 세션 복원이 끝난 뒤에만 초기 탭을 공개한다', async () => {
    const input = setup();
    const auth = deferred<AuthResult>();
    input.current.sessionId = undefined;
    input.getSession.mockReturnValue(auth.promise);
    input.start();
    input.initial.resolve(message('initial'));
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen).toBeNull();
    input.current.sessionId = session.sessionId;
    input.listeners.session();
    auth.resolve(signedIn);
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen).not.toBeNull();
  });

  it.each<AuthResult>([
    { status: 'SIGNED_OUT' },
    { status: 'UNAVAILABLE', code: 'NETWORK', retryable: true },
  ])('복원 불가 결과는 다음 로그인에 넘기지 않는다: %j', async (result) => {
    const input = setup();
    input.getSession.mockResolvedValue(result);
    const stop = input.start();
    input.initial.resolve(message('initial'));
    await flush();
    stop();
    input.current.generation += 1;
    input.getSession.mockResolvedValue(signedIn);
    input.start();
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen).toBeNull();
  });

  it('새 탭 뒤에 완료된 초기 알림은 새 대기를 덮지 않는다', async () => {
    const input = setup();
    input.start();
    input.listeners.opened(message('new'));
    await flush();
    const opened = input.state.getNotificationBridgeState().notificationOpen;
    input.initial.resolve(message('old'));
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen).toEqual(opened);
    expect(input.publish).toHaveBeenCalledTimes(1);
  });

  it('인증 조회 중 로그아웃하면 늦은 탭 응답을 폐기한다', async () => {
    const input = setup();
    const auth = deferred<AuthResult>();
    input.getSession.mockReturnValue(auth.promise);
    input.start();
    input.listeners.opened(message('old'));
    input.current.generation += 1;
    input.current.sessionId = undefined;
    input.listeners.session();
    auth.resolve(signedIn);
    await flush();
    expect(input.state.getNotificationBridgeState().notificationOpen).toBeNull();
  });

  it('토큰 갱신은 대기를 유지하고 계정 교체는 대기를 지운다', async () => {
    const input = setup();
    input.start();
    input.listeners.opened(message('one'));
    await flush();
    input.listeners.session();
    expect(input.state.getNotificationBridgeState().notificationOpen).not.toBeNull();
    input.current.generation += 1;
    input.current.sessionId = 'session-2';
    input.listeners.session();
    expect(input.state.getNotificationBridgeState().notificationOpen).toBeNull();
  });

  it('정리된 리스너와 초기 응답은 상태를 바꾸지 않고 재시작은 초기 조회를 공유한다', async () => {
    const input = setup();
    const stop = input.start();
    stop();
    input.listeners.received(message('late'));
    input.listeners.opened(message('late'));
    input.initial.resolve(message('initial'));
    await flush();
    expect(input.publish).not.toHaveBeenCalled();
    for (const unsubscribe of Object.values(input.unsubscribe)) {
      expect(unsubscribe).toHaveBeenCalledOnce();
    }
    input.start();
    await flush();
    expect(input.getInitialNotification).toHaveBeenCalledOnce();
    expect(input.state.getNotificationBridgeState().notificationOpen?.eventId).toBe(
      'notification-open-1',
    );
  });
});
