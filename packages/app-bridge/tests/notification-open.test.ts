/** 웹에 노출하는 탐색·확인·갱신 계약의 신뢰 경계를 검증합니다. */
import { describe, expect, it } from 'vitest';
import {
  notificationOpenSchema,
  acknowledgeNotificationOpenInputSchema,
  notificationRevisionSchema,
} from '../src/index';

describe('알림 탐색 계약', () => {
  it('대상과 이벤트 ID만 공개하고 원문 본문은 제거한다', () => {
    expect(
      notificationOpenSchema.parse({
        eventId: 'open-1',
        destination: { type: 'POST', postId: 1 },
        body: '본문',
      }),
    ).toEqual({ eventId: 'open-1', destination: { type: 'POST', postId: 1 } });
  });

  it.each([
    { eventId: '', destination: { type: 'ALERTS' } },
    { eventId: 'open-1', destination: { type: 'URL', url: 'https://example.com' } },
    { eventId: 'open-1', destination: { type: 'POST', postId: '1' } },
    { eventId: 'open-1', destination: { type: 'POST', postId: 0 } },
    { eventId: 'open-1', destination: { type: 'POST', postId: Number.MAX_SAFE_INTEGER + 1 } },
  ])('잘못된 탐색 이벤트를 거부한다: %j', (input) => {
    expect(notificationOpenSchema.safeParse(input).success).toBe(false);
  });

  it('확인은 비어 있지 않은 이벤트 ID, revision은 음수가 아닌 안전한 정수만 허용한다', () => {
    expect(acknowledgeNotificationOpenInputSchema.safeParse({ eventId: '' }).success).toBe(false);
    expect(acknowledgeNotificationOpenInputSchema.parse({ eventId: 'open-1' })).toEqual({
      eventId: 'open-1',
    });
    expect(notificationRevisionSchema.parse(0)).toBe(0);
    for (const value of [-1, 0.5, '1', Number.MAX_SAFE_INTEGER + 1]) {
      expect(notificationRevisionSchema.safeParse(value).success).toBe(false);
    }
  });
});
