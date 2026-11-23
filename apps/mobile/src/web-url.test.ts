/** iOS 시뮬레이터 WebView가 CORS 허용 localhost origin을 사용하는지 검증합니다. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveMobileWebUrl } from './web-url';

const native = vi.hoisted(
  (): {
    platform: { OS: string };
    expoConfig: { extra: unknown; hostUri: string | undefined };
  } => ({
    platform: { OS: 'ios' },
    expoConfig: { extra: undefined, hostUri: undefined },
  }),
);

vi.mock('expo-constants', () => ({
  default: { expoConfig: native.expoConfig },
}));
vi.mock('react-native', () => ({ Platform: native.platform }));

beforeEach(() => {
  native.platform.OS = 'ios';
  native.expoConfig.extra = undefined;
  native.expoConfig.hostUri = undefined;
});

describe('resolveMobileWebUrl', () => {
  it('iOS에서는 Metro가 127.0.0.1을 알려도 localhost:3000을 사용한다', () => {
    native.expoConfig.hostUri = '127.0.0.1:8081';

    expect(resolveMobileWebUrl()).toBe('http://localhost:3000');
  });

  it('명시한 배포 WebView URL은 플랫폼보다 우선한다', () => {
    native.expoConfig.extra = { mobileWebUrl: 'https://yapp-plus-web.vercel.app' };

    expect(resolveMobileWebUrl()).toBe('https://yapp-plus-web.vercel.app');
  });
});
