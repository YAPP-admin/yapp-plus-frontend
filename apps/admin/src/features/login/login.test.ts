import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../mocks/server';
import { readAdminAccessToken } from './admin-session';
import { login } from './login';

const successResponse = {
  staff: { id: 1, displayName: '합성 운영진' },
  accessToken: 'synthetic-login-token',
};

describe('관리자 로그인 API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('아이디와 비밀번호를 Staff 요청으로 변환하고 token을 저장한다', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${apiBaseUrl}/api/admin/auth/sessions`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(successResponse);
      }),
    );

    await expect(
      login({ username: 'admin-id', password: 'password with spaces' }),
    ).resolves.toEqual({
      status: 'success',
    });

    expect(requestBody).toEqual({
      loginId: 'admin-id',
      password: 'password with spaces',
    });
    expect(readAdminAccessToken()).toBe('synthetic-login-token');
  });

  it('401을 자격 증명 오류로 변환하고 기존 token을 유지한다', async () => {
    localStorage.setItem('yapp-plus-admin.access-token.v1', 'existing-token');
    server.use(
      http.post(`${apiBaseUrl}/api/admin/auth/sessions`, () =>
        HttpResponse.json({ code: 'STAFF_AUTHENTICATION_FAILED' }, { status: 401 }),
      ),
    );

    await expect(login({ username: 'wrong-id', password: 'wrong-password' })).resolves.toEqual({
      status: 'invalid-credentials',
    });

    expect(readAdminAccessToken()).toBe('existing-token');
  });

  it.each([400, 500])('인증 서비스의 %s 응답을 서비스 오류로 변환한다', async (status) => {
    server.use(
      http.post(`${apiBaseUrl}/api/admin/auth/sessions`, () =>
        HttpResponse.json({ code: 'INVALID_REQUEST' }, { status }),
      ),
    );

    await expect(login({ username: 'admin-id', password: 'password' })).resolves.toEqual({
      status: 'unavailable',
    });
    expect(readAdminAccessToken()).toBeUndefined();
  });

  it('네트워크 오류를 서비스 오류로 변환한다', async () => {
    server.use(http.post(`${apiBaseUrl}/api/admin/auth/sessions`, () => HttpResponse.error()));

    await expect(login({ username: 'admin-id', password: 'password' })).resolves.toEqual({
      status: 'unavailable',
    });
  });

  it('계약에 맞지 않는 성공 응답을 저장하지 않는다', async () => {
    localStorage.setItem('yapp-plus-admin.access-token.v1', 'existing-token');
    server.use(
      http.post(`${apiBaseUrl}/api/admin/auth/sessions`, () =>
        HttpResponse.json({ staff: successResponse.staff }),
      ),
    );

    await expect(login({ username: 'admin-id', password: 'password' })).resolves.toEqual({
      status: 'unavailable',
    });
    expect(readAdminAccessToken()).toBe('existing-token');
  });

  it('token 저장에 실패하면 성공으로 처리하지 않는다', async () => {
    const browserWindow = window;
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('쓰기 실패');
        },
      },
    });
    server.use(
      http.post(`${apiBaseUrl}/api/admin/auth/sessions`, () => HttpResponse.json(successResponse)),
    );

    await expect(login({ username: 'admin-id', password: 'password' })).resolves.toEqual({
      status: 'unavailable',
    });

    vi.stubGlobal('window', browserWindow);
  });
});
