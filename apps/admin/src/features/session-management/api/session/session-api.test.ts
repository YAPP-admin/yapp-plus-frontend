import type { CreateSessionRequest, SessionListResponse } from '@yapp-plus/api/generated';
import { QueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import {
  createSession,
  createSessionMutationOptions,
  deleteSession,
  deleteSessionMutationOptions,
  listSessions,
  sessionsQueryOptions,
  updateSession,
  updateSessionMutationOptions,
} from './index';

const requestBody = {
  name: '정규 세션',
  location: '서울특별시 중구 세종대로 110 예시 교육장',
  date: '2026-11-21',
  startTime: '14:00:00',
  endTime: '18:00:00',
  type: 'REGULAR',
  roadAddress: '서울특별시 중구 세종대로 110',
  detailAddress: '예시 교육장',
  latitude: 37.5665,
  longitude: 126.978,
} satisfies CreateSessionRequest;

const listResponse = {
  totalCount: 1,
  allCount: 1,
  regularCount: 1,
  teamCount: 0,
  sessions: [],
} satisfies SessionListResponse;

describe('세션 API adapter', () => {
  it('기수 전체 세션 목록을 조회한다', async () => {
    let requestedUrl = '';
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(listResponse);
      }),
    );

    await expect(listSessions(25)).resolves.toEqual(listResponse);

    const url = new URL(requestedUrl);
    expect(url.pathname).toBe('/api/admin/generations/25/sessions');
    expect(url.searchParams.get('type')).toBe('ALL');
  });

  it('생성 요청에 기수 ID와 생성 본문을 전달하고 응답을 반환한다', async () => {
    let requestedPath = '';
    let requestedBody: unknown;
    server.use(
      http.post(
        `${apiBaseUrl}/api/admin/generations/:generationId/sessions`,
        async ({ params, request }) => {
          requestedPath = String(params.generationId);
          requestedBody = await request.json();
          return HttpResponse.json({ sessionId: 301 }, { status: 201 });
        },
      ),
    );

    await expect(createSession(25, requestBody)).resolves.toEqual({ sessionId: 301 });
    expect(requestedPath).toBe('25');
    expect(requestedBody).toEqual(requestBody);
  });

  it('수정 요청에 기수·세션 ID와 전체 본문을 전달하고 204를 완료로 처리한다', async () => {
    let requestedPath = '';
    let requestedBody: unknown;
    server.use(
      http.put(
        `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
        async ({ params, request }) => {
          requestedPath = `${String(params.generationId)}/${String(params.sessionId)}`;
          requestedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(updateSession(25, 301, requestBody)).resolves.toBeUndefined();
    expect(requestedPath).toBe('25/301');
    expect(requestedBody).toEqual(requestBody);
  });

  it('삭제 요청에 기수·세션 ID만 전달하고 204를 완료로 처리한다', async () => {
    let requestedPath = '';
    let requestedBody = '';
    server.use(
      http.delete(
        `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
        async ({ params, request }) => {
          requestedPath = `${String(params.generationId)}/${String(params.sessionId)}`;
          requestedBody = await request.text();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(deleteSession(25, 301)).resolves.toBeUndefined();
    expect(requestedPath).toBe('25/301');
    expect(requestedBody).toBe('');
  });
});

describe('세션 query/mutation options', () => {
  it('목록 query option이 생성 SDK key와 기수 ID를 사용한다', async () => {
    let requestedPath = '';
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, ({ params }) => {
        requestedPath = String(params.generationId);
        return HttpResponse.json(listResponse);
      }),
    );

    const client = new QueryClient();
    await expect(client.fetchQuery(sessionsQueryOptions(25))).resolves.toEqual(listResponse);
    expect(requestedPath).toBe('25');
    expect(sessionsQueryOptions(25).queryKey).not.toEqual(sessionsQueryOptions(26).queryKey);
  });

  it('Mutation options가 명시한 기수·세션 ID로 생성·수정·삭제한다', async () => {
    const requests: string[] = [];
    server.use(
      http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, ({ params }) => {
        requests.push(`POST ${String(params.generationId)}`);
        return HttpResponse.json({ sessionId: 301 }, { status: 201 });
      }),
      http.put(
        `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
        ({ params }) => {
          requests.push(`PUT ${String(params.generationId)}/${String(params.sessionId)}`);
          return new HttpResponse(null, { status: 204 });
        },
      ),
      http.delete(
        `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
        ({ params }) => {
          requests.push(`DELETE ${String(params.generationId)}/${String(params.sessionId)}`);
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const client = new QueryClient();
    await expect(
      client
        .getMutationCache()
        .build(client, createSessionMutationOptions(25))
        .execute(requestBody),
    ).resolves.toEqual({ sessionId: 301 });
    await expect(
      client
        .getMutationCache()
        .build(client, updateSessionMutationOptions(25, 301))
        .execute(requestBody),
    ).resolves.toBeUndefined();
    await expect(
      client
        .getMutationCache()
        .build(client, deleteSessionMutationOptions(25, 301))
        .execute(undefined),
    ).resolves.toBeUndefined();

    expect(requests).toEqual(['POST 25', 'PUT 25/301', 'DELETE 25/301']);
  });
});
