/** 관리자 로그아웃 adapter가 서버 세션 폐기와 인증 헤더를 보존하는지 검증합니다. */
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { configureAdminApiClient } from '../../admin-session';
import { logout } from './logout';

describe('관리자 로그아웃 API', () => {
  beforeEach(() => {
    localStorage.setItem('yapp-plus-admin.access-token.v1', 'synthetic-staff-token');
    configureAdminApiClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('현재 Staff 세션 폐기 endpoint를 호출하고 Bearer token을 전달한다', async () => {
    let requestCount = 0;
    let authorization: string | null = null;
    server.use(
      http.delete(`${apiBaseUrl}/api/admin/auth/sessions/current`, ({ request }) => {
        requestCount += 1;
        authorization = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await expect(logout()).resolves.toBeUndefined();

    expect(requestCount).toBe(1);
    expect(authorization).toBe('Bearer synthetic-staff-token');
  });

  it('서버 오류는 호출자에게 전달한다', async () => {
    server.use(
      http.delete(`${apiBaseUrl}/api/admin/auth/sessions/current`, () =>
        HttpResponse.json({ code: 'STAFF_AUTHENTICATION_FAILED' }, { status: 401 }),
      ),
    );

    await expect(logout()).rejects.toBeDefined();
  });
});
