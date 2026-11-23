/** 회원 웹 API 기준 주소의 검증과 생성 client 초기화 순서를 회귀 검증합니다. */

import { describe, expect, it, vi } from 'vitest';
import { configureWebApiClient, getWebApiBaseUrl } from './api-environment';

describe('getWebApiBaseUrl', () => {
  it('HTTPS API 주소를 정규화한다', () => {
    expect(getWebApiBaseUrl('https://example.invalid/')).toBe('https://example.invalid');
  });

  it.each([undefined, null, '', '   ', 42, 'not-a-url', 'http://example.invalid'])(
    '누락되었거나 HTTPS가 아닌 주소를 거절한다: %p',
    (value) => {
      expect(() => getWebApiBaseUrl(value)).toThrow('VITE_API_BASE_URL');
    },
  );

  it('사용자 정보가 포함된 주소를 거절한다', () => {
    expect(() => getWebApiBaseUrl('https://user:password@example.invalid')).toThrow(
      '사용자 정보가 없는 HTTPS URL',
    );
  });
});

describe('configureWebApiClient', () => {
  it('검증한 주소만 생성 client에 적용한다', () => {
    const setConfig = vi.fn<(config: { baseUrl: string }) => void>();

    expect(configureWebApiClient({ setConfig }, 'https://example.invalid/')).toBe(
      'https://example.invalid',
    );
    expect(setConfig).toHaveBeenCalledExactlyOnceWith({ baseUrl: 'https://example.invalid' });
  });
});
