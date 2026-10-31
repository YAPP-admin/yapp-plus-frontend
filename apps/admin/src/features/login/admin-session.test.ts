import { client, logout } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../mocks/server';
import {
  configureAdminApiClient,
  readAdminAccessToken,
  saveAdminAccessToken,
} from './admin-session';

const staffAuth = {
  key: 'staffBearerAuth',
  scheme: 'bearer' as const,
  type: 'http' as const,
};

const userAuth = {
  key: 'userBearerAuth',
  scheme: 'bearer' as const,
  type: 'http' as const,
};

function getConfiguredAuth() {
  const auth = client.getConfig().auth;
  if (typeof auth !== 'function') {
    throw new Error('관리자 API client auth callback이 설정되지 않았습니다.');
  }
  return auth;
}

describe('관리자 세션', () => {
  beforeEach(() => {
    localStorage.clear();
    configureAdminApiClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('저장한 token을 앱 재초기화 뒤에도 읽는다', () => {
    expect(saveAdminAccessToken('synthetic-staff-token')).toBe(true);

    configureAdminApiClient();

    expect(readAdminAccessToken()).toBe('synthetic-staff-token');
  });

  it('빈 token은 저장하지 않는다', () => {
    expect(saveAdminAccessToken('')).toBe(false);
    expect(readAdminAccessToken()).toBeUndefined();
  });

  it('localStorage 읽기와 쓰기 실패를 안전하게 처리한다', () => {
    const browserWindow = window;
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('읽기 실패');
        },
        setItem: () => {
          throw new Error('쓰기 실패');
        },
      },
    });
    expect(readAdminAccessToken()).toBeUndefined();
    expect(saveAdminAccessToken('synthetic-staff-token')).toBe(false);

    vi.stubGlobal('window', browserWindow);
  });

  it('SSR에서는 token을 반환하지 않는다', () => {
    const browserWindow = window;
    vi.stubGlobal('window', undefined);

    expect(readAdminAccessToken()).toBeUndefined();
    expect(saveAdminAccessToken('synthetic-staff-token')).toBe(false);

    vi.stubGlobal('window', browserWindow);
  });

  it('Staff 인증 key에만 token을 제공한다', () => {
    saveAdminAccessToken('synthetic-staff-token');
    const auth = getConfiguredAuth();

    expect(auth(staffAuth)).toBe('synthetic-staff-token');
    expect(auth(userAuth)).toBeUndefined();
  });

  it('요청 시점의 저장값을 읽어 token 교체를 반영한다', () => {
    const auth = getConfiguredAuth();

    saveAdminAccessToken('first-synthetic-token');
    expect(auth(staffAuth)).toBe('first-synthetic-token');

    saveAdminAccessToken('second-synthetic-token');
    expect(auth(staffAuth)).toBe('second-synthetic-token');
  });

  it('Staff SDK 요청에 Bearer token을 전달한다', async () => {
    let authorization: string | null = null;
    server.use(
      http.delete(`${apiBaseUrl}/api/admin/auth/sessions/current`, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    saveAdminAccessToken('synthetic-staff-token');

    await logout();

    expect(authorization).toBe('Bearer synthetic-staff-token');
  });
});
