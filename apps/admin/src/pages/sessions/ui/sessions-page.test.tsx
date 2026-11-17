/** 생성 SDK 요청과 세션 목록의 정상·빈·오류 상태를 MSW로 검증한다. */
import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { client } from '@yapp-plus/api/generated';
import type { SessionListResponse } from '@yapp-plus/api/generated';
import { fakeAdminSessionResponse } from '@yapp-plus/api/generated/faker';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import { apiBaseUrl, server } from '../../../mocks/server';
import type { SessionFilter } from '../model/session-search';
import { SessionsPage } from './sessions-page';

const REGULAR_SESSION = {
  ...fakeAdminSessionResponse(),
  sessionId: 101,
  name: '정규 세션',
  location: '서울특별시 중구 세종대로 110 예시 교육장',
  date: '2026-10-31',
  startTime: '14:00:10',
  endTime: '18:00:20',
  type: 'REGULAR' as const,
  roadAddress: '서울특별시 중구 세종대로 110',
  detailAddress: '예시 교육장',
  latitude: 37.5665,
  longitude: 126.978,
  attendanceSummary: {
    status: 'STARTED' as const,
    totalCount: 3,
    presentCount: 1,
    absentCount: 1,
    undecidedCount: 1,
  },
};
const TEAM_SESSION = {
  ...fakeAdminSessionResponse(),
  sessionId: 102,
  name: '팀 세션',
  location: null,
  date: '2026-11-07',
  startTime: '14:00:00',
  endTime: '18:00:00',
  type: 'TEAM' as const,
  roadAddress: null,
  detailAddress: null,
  latitude: null,
  longitude: null,
  attendanceSummary: {
    status: 'NOT_STARTED' as const,
    totalCount: 3,
    presentCount: 0,
    absentCount: 0,
    undecidedCount: 3,
  },
};
const SESSION_LIST = {
  totalCount: 2,
  allCount: 2,
  regularCount: 1,
  teamCount: 1,
  sessions: [REGULAR_SESSION, TEAM_SESSION],
} satisfies SessionListResponse;

beforeEach(() => {
  vi.stubEnv('SSR', false);
});

afterEach(() => {
  vi.unstubAllEnvs();
  client.setConfig({ auth: undefined });
});

async function setup(generationId: number | null, initialType: SessionFilter = 'all') {
  const queryClient = createAdminQueryClient();

  function Harness() {
    const [type, setType] = useState(initialType);
    return (
      <QueryClientProvider client={queryClient}>
        <SessionsPage type={type} generationId={generationId} onTypeChange={setType} />
      </QueryClientProvider>
    );
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: Harness }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);

  return userEvent.setup();
}

it('기수 설정이 없으면 API를 호출하지 않고 설정 안내를 표시한다', async () => {
  let requestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      requestCount += 1;
      return HttpResponse.json(SESSION_LIST);
    }),
  );

  await setup(null);

  expect(await screen.findByText('기수 ID 설정이 필요합니다.')).toBeVisible();
  expect(requestCount).toBe(0);
});

it('생성 Query 옵션으로 기수 전체 목록을 조회하고 인증 헤더를 전달한다', async () => {
  let requestedUrl = '';
  let authorization = '';
  client.setConfig({ auth: () => 'test-access-token' });
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, ({ request }) => {
      requestedUrl = request.url;
      authorization = request.headers.get('authorization') ?? '';
      return HttpResponse.json(SESSION_LIST);
    }),
  );

  await setup(25);

  const list = await screen.findByRole('list', { name: '세션 목록' });
  expect(
    within(list)
      .getAllByRole('heading')
      .map((heading) => heading.textContent),
  ).toEqual(['팀 세션', '정규 세션']);
  expect(requestedUrl).toBe(`${apiBaseUrl}/api/admin/generations/25/sessions?type=ALL`);
  expect(authorization).toBe('Bearer test-access-token');
  expect(screen.queryByRole('button', { name: '세션 추가' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /정보/ })).not.toBeInTheDocument();
});

it('빈 응답과 유형 필터 빈 상태를 구분한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json({
        ...SESSION_LIST,
        totalCount: 0,
        allCount: 0,
        regularCount: 0,
        teamCount: 0,
        sessions: [],
      }),
    ),
  );
  await setup(25, 'offline');
  expect(await screen.findByText('등록된 세션이 없습니다.')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('오프라인 0개');
});

it('조회 오류를 노출하지 않고 재시도 후 목록을 복구한다', async () => {
  let requestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      requestCount += 1;
      return requestCount === 1
        ? HttpResponse.json({ code: 'GENERATION_NOT_FOUND', message: 'private' }, { status: 404 })
        : HttpResponse.json(SESSION_LIST);
    }),
  );
  const user = await setup(25);
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 불러오지 못했습니다.');
  expect(screen.queryByText('private')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  await waitFor(() => expect(requestCount).toBe(2));
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
});
