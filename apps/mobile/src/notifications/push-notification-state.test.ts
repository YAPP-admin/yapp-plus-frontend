/** 수신과 탭의 분리, 최신 대기 보존, 계정 경계에서의 폐기를 검증합니다. */
import { describe, expect, it } from 'vitest';
import { PushNotificationState } from './push-notification-state';

const message = (id: string) => ({
  data: { source: 'POST', postId: '42', postPushDeliveryId: id },
});

describe('PushNotificationState', () => {
  it('같은 메시지를 수신한 뒤 탭할 수 있고 중복 수신·탭은 무시한다', () => {
    const state = new PushNotificationState();
    expect(state.recordReceivedPushIfNew(message('a'))).toBe(true);
    expect(state.recordReceivedPushIfNew(message('a'))).toBe(false);
    expect(state.getNotificationBridgeState()).toEqual({
      notificationOpen: null,
      notificationRevision: 1,
    });
    expect(state.setPendingNotificationOpenIfNew(message('a'))).toBe(true);
    expect(state.setPendingNotificationOpenIfNew(message('a'))).toBe(false);
    expect(state.getNotificationBridgeState().notificationOpen?.destination).toEqual({
      type: 'POST',
      postId: 42,
    });
  });

  it('오래된 ack나 중복 탭이 최신 대기를 지우거나 덮어쓰지 않는다', () => {
    const state = new PushNotificationState();
    state.setPendingNotificationOpenIfNew(message('a'));
    const first = state.getNotificationBridgeState().notificationOpen;
    state.setPendingNotificationOpenIfNew(message('b'));
    const latest = state.getNotificationBridgeState().notificationOpen;
    state.acknowledgeNotificationOpen(first?.eventId ?? '');
    state.setPendingNotificationOpenIfNew(message('a'));
    expect(state.getNotificationBridgeState().notificationOpen).toEqual(latest);
    state.acknowledgeNotificationOpen(latest?.eventId ?? '');
    state.acknowledgeNotificationOpen(latest?.eventId ?? '');
    expect(state.getNotificationBridgeState().notificationOpen).toBeNull();
  });

  it('계정 경계는 대기를 폐기하고 이미 처리한 발송의 늦은 콜백은 무시한다', () => {
    const state = new PushNotificationState();
    state.setPendingNotificationOpenIfNew(message('a'));
    state.clearPendingNotificationOpen();
    expect(state.setPendingNotificationOpenIfNew(message('a'))).toBe(false);
    expect(state.getNotificationBridgeState().notificationOpen).toBeNull();
    expect(state.setPendingNotificationOpenIfNew(message('b'))).toBe(true);
  });

  it('식별자가 없으면 별도 콜백을 같은 알림으로 추정하지 않는다', () => {
    const state = new PushNotificationState();
    state.setPendingNotificationOpenIfNew({});
    const first = state.getNotificationBridgeState().notificationOpen;
    state.setPendingNotificationOpenIfNew({});
    expect(state.getNotificationBridgeState().notificationOpen?.eventId).not.toBe(first?.eventId);
    state.recordReceivedPushIfNew({});
    state.recordReceivedPushIfNew({});
    expect(state.getNotificationBridgeState().notificationRevision).toBe(2);
  });
});
