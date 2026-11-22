/** 관리자 기수 API adapter와 Query 옵션의 HTTP 경계를 검증합니다. */
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { configureAdminApiClient } from '../../../login/admin-session';
import { generationsQueryKey, generationsQueryOptions, listGenerations } from './index';

const generations = {
  generations: [
    { generationId: 33, generationNumber: 33, generationName: '33기' },
    { generationId: 32, generationNumber: 32, generationName: '32기' },
  ],
};

describe('관리자 기수 API', () => {
  beforeEach(() => {
    localStorage.setItem('yapp-plus-admin.access-token.v1', 'synthetic-staff-token');
    configureAdminApiClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('기수 목록 endpoint를 호출하고 생성 DTO를 반환한다', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations`, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json(generations);
      }),
    );

    await expect(listGenerations()).resolves.toEqual(generations);
    expect(authorization).toBe('Bearer synthetic-staff-token');
  });

  it('query options는 동일한 key로 API 응답을 조회한다', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations`, () => {
        requestCount += 1;
        return HttpResponse.json(generations);
      }),
    );

    const options = generationsQueryOptions();

    expect(options.queryKey).toEqual(generationsQueryKey());
    await expect(new QueryClient().fetchQuery(options)).resolves.toEqual(generations);
    expect(requestCount).toBe(1);
  });

  it('응답 계약이 잘못되면 조회를 실패한다', async () => {
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations`, () =>
        HttpResponse.json({ generations: [{ generationId: 33 }] }),
      ),
    );

    await expect(listGenerations()).rejects.toThrow('generationNumber');
  });
});
