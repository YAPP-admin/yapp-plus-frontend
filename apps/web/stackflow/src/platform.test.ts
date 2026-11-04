import { describe, expect, it } from 'vitest';
import { detectPlatform, getAppScreenOptions } from './platform';

describe('Stackflow 플랫폼 정책', () => {
  it('표준 User-Agent를 iOS, Android, web으로 구분한다', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe('android');
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)')).toBe('web');
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)', 5)).toBe('ios');
  });

  it('플랫폼별 transition과 swipe 정책을 반환한다', () => {
    expect(getAppScreenOptions('ios', false)).toEqual({
      theme: 'cupertino',
      transitionStyle: 'slideFromRightIOS',
      preventSwipeBack: false,
    });
    expect(getAppScreenOptions('android', false)).toEqual({
      theme: 'android',
      transitionStyle: 'fadeFromBottomAndroid',
      preventSwipeBack: true,
    });
    expect(getAppScreenOptions('web', false)).toEqual({
      theme: 'cupertino',
      transitionStyle: 'fadeIn',
      preventSwipeBack: true,
    });
  });

  it('reduced motion에서는 전환과 swipe를 비활성화한다', () => {
    expect(getAppScreenOptions('ios', true)).toEqual({
      theme: 'cupertino',
      transitionStyle: 'fadeIn',
      preventSwipeBack: true,
    });
  });

  it('화면별 차단은 iOS 기본 swipe를 끄고 플랫폼 차단을 해제하지 않는다', () => {
    expect(getAppScreenOptions('ios', false, true).preventSwipeBack).toBe(true);
    expect(getAppScreenOptions('android', false, false).preventSwipeBack).toBe(true);
    expect(getAppScreenOptions('web', false, false).preventSwipeBack).toBe(true);
    expect(getAppScreenOptions('ios', true, false).preventSwipeBack).toBe(true);
  });
});
