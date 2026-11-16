/** 외부 payload가 임의 경로·잘못된 공지 ID로 탐색되지 않도록 검증합니다. */
import { describe, expect, it } from 'vitest';
import { parsePushTarget } from './push-target';

describe('parsePushTarget', () => {
  it('POST의 문자열 ID만 안전한 숫자로 변환하고 본문·URL을 제거한다', () => {
    expect(
      parsePushTarget({
        data: { source: 'POST', postId: '42', body: '본문', url: 'https://example.com' },
      }).destination,
    ).toEqual({ type: 'POST', postId: 42 });
  });

  it.each(['0', '-1', '1.5', '1e2', ' 42', '42x', '9007199254740992', '', null, 42])(
    '잘못된 공지 ID %s는 알림함으로 보낸다',
    (postId) => {
      expect(parsePushTarget({ data: { source: 'POST', postId } }).destination).toEqual({
        type: 'ALERTS',
      });
    },
  );

  it.each([
    undefined,
    null,
    [],
    'POST',
    { source: 'GENERAL', postId: '42' },
    { source: 'OTHER', postId: '42' },
    { source: 'POST', notificationId: '42' },
  ])('잘못된 대상과 일반 알림은 알림함으로 보낸다: %j', (data) => {
    expect(parsePushTarget({ data }).destination).toEqual({ type: 'ALERTS' });
  });

  it('잘못된 공지 ID와 관계없는 필드는 유효한 대상·발송 식별자를 오염시키지 않는다', () => {
    expect(
      parsePushTarget({
        data: { source: 'POST', postId: 'invalid', postPushDeliveryId: 'delivery-1' },
      }),
    ).toEqual({
      destination: { type: 'ALERTS' },
      deliveryKey: JSON.stringify(['POST', 'delivery-1']),
    });

    expect(
      parsePushTarget({
        data: { source: 'POST', postId: '42', notificationId: { invalid: true } },
        messageId: 'fcm-1',
      }),
    ).toEqual({
      destination: { type: 'POST', postId: 42 },
      deliveryKey: JSON.stringify(['FCM', 'fcm-1']),
    });
  });

  it('source 없는 일반 푸시는 알림함으로 보내고 notificationId로 중복을 구분한다', () => {
    expect(parsePushTarget({ data: { notificationId: '7' } })).toEqual({
      destination: { type: 'ALERTS' },
      deliveryKey: JSON.stringify(['GENERAL', '7']),
    });
  });

  it('종류별 발송 식별자를 우선하고 없으면 FCM ID를 사용한다', () => {
    const post = parsePushTarget({
      data: { source: 'POST', postPushDeliveryId: '7', notificationId: '8' },
      messageId: 'fcm',
    });
    const general = parsePushTarget({
      data: { source: 'GENERAL', notificationId: '7' },
      messageId: 'fcm',
    });
    expect(post.deliveryKey).toBe(JSON.stringify(['POST', '7']));
    expect(general.deliveryKey).toBe(JSON.stringify(['GENERAL', '7']));
    expect(
      parsePushTarget({ data: { source: 'POST', postPushDeliveryId: ' ' }, messageId: 'fcm' })
        .deliveryKey,
    ).toBe(JSON.stringify(['FCM', 'fcm']));
    expect(parsePushTarget({}).deliveryKey).toBeUndefined();
  });
});
