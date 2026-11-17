/** 생성 SDK 요청과 세션 목록의 정상·빈·오류 상태를 MSW로 검증한다. */
import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
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
import { AdminOverlayProvider } from '../../../app/ui/admin-overlay-provider';
import { createAdminQueryClient } from '../../../query-client';
import { apiBaseUrl, server } from '../../../mocks/server';
import type { SessionInput } from '../model/session-form';
import type { SessionFilter } from '../model/session-search';
import { SessionsPage } from './sessions-page';

vi.mock('./session-form', () => ({
  SessionForm: ({
    submissionPending,
    submissionError,
    initialValues,
    onSubmit,
    onClose,
  }: {
    submissionPending?: boolean;
    submissionError?: string;
    initialValues?: SessionInput;
    onSubmit: (input: SessionInput) => void;
    onClose: () => void;
  }) => (
    <dialog open aria-label={initialValues ? '세션 수정' : '세션 추가'}>
      <span>
        {initialValues
          ? [
              initialValues.name,
              initialValues.date,
              initialValues.startTime,
              initialValues.endTime,
              initialValues.type === 'offline' ? initialValues.location.roadAddress : '',
            ].join('|')
          : '팀 세션 초안'}
      </span>
      {submissionError ? <p role="alert">{submissionError}</p> : null}
      <button
        type="button"
        disabled={submissionPending}
        onClick={() =>
          onSubmit(
            initialValues
              ? { ...initialValues, name: `${initialValues.name} 수정` }
              : {
                  name: '팀 세션 초안',
                  date: '2026-11-21',
                  startTime: '14:00:00',
                  endTime: '18:00:00',
                  type: 'team',
                },
          )
        }
      >
        테스트 세션 저장
      </button>
      {initialValues ? (
        <button
          type="button"
          disabled={submissionPending}
          onClick={() =>
            onSubmit({
              name: `${initialValues.name} 팀 전환`,
              date: initialValues.date,
              startTime: initialValues.startTime,
              endTime: initialValues.endTime,
              type: 'team',
            })
          }
        >
          팀으로 변경 저장
        </button>
      ) : null}
      <button type="button" disabled={submissionPending} onClick={onClose}>
        취소
      </button>
    </dialog>
  ),
}));

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
const CREATED_TEAM_SESSION = {
  ...TEAM_SESSION,
  sessionId: 301,
  name: '팀 세션 초안',
  date: '2026-11-21',
};
const UPDATED_TEAM_SESSION = {
  ...TEAM_SESSION,
  sessionId: 101,
  name: '정규 세션 팀 전환',
  date: REGULAR_SESSION.date,
  startTime: REGULAR_SESSION.startTime,
  endTime: REGULAR_SESSION.endTime,
};

beforeEach(() => {
  vi.stubEnv('SSR', false);
});

afterEach(() => {
  vi.unstubAllEnvs();
  onlineManager.setOnline(true);
  client.setConfig({ auth: undefined });
});

async function setup(generationId: number | null, initialType: SessionFilter = 'all') {
  const queryClient = createAdminQueryClient();

  function Harness() {
    const [type, setType] = useState(initialType);
    return (
      <QueryClientProvider client={queryClient}>
        <AdminOverlayProvider>
          <SessionsPage type={type} generationId={generationId} onTypeChange={setType} />
        </AdminOverlayProvider>
      </QueryClientProvider>
    );
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: Harness }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  const rendered = render(<RouterProvider router={router} />);

  return { user: userEvent.setup(), queryClient, router, ...rendered };
}

async function openEdit(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = await screen.findByRole('button', { name: `${name} 관리` });
  trigger.focus();
  await user.keyboard('{Enter}');
  const menu = await screen.findByRole('menu', { name: `${name} 관리` });
  expect(within(menu).getByRole('menuitem', { name: '정보' })).toHaveFocus();
  await user.keyboard('{Enter}');
  return screen.findByRole('dialog', { name: '세션 수정' });
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
  expect(screen.getByRole('button', { name: '세션 추가' })).toBeVisible();
  expect(screen.getByRole('button', { name: '팀 세션 관리' })).toBeVisible();
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
  const { user } = await setup(25);
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 불러오지 못했습니다.');
  expect(screen.queryByText('private')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  await waitFor(() => expect(requestCount).toBe(2));
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
});

it('진행 중인 이전 목록을 취소하고 생성 결과를 전체 필터에서 다시 조회한다', async () => {
  let listRequestCount = 0;
  let releaseOldList: (() => void) | undefined;
  const oldListPending = new Promise<void>((resolve) => {
    releaseOldList = resolve;
  });
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, async () => {
      listRequestCount += 1;
      if (listRequestCount === 1) {
        await oldListPending;
        return HttpResponse.json(SESSION_LIST);
      }
      return HttpResponse.json({
        ...SESSION_LIST,
        totalCount: 3,
        allCount: 3,
        teamCount: 2,
        sessions: [CREATED_TEAM_SESSION, ...SESSION_LIST.sessions],
      });
    }),
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json({ sessionId: 301 }, { status: 201 }),
    ),
  );

  const { user } = await setup(25, 'team');
  await user.click(await screen.findByRole('button', { name: '세션 추가' }));
  await user.click(screen.getByRole('button', { name: '테스트 세션 저장' }));

  expect(await screen.findByText('세션을 추가했습니다.')).toBeVisible();
  expect(await screen.findByRole('heading', { name: '팀 세션 초안' })).toBeVisible();
  expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('전체 3개');
  releaseOldList?.();
  await waitFor(() => expect(listRequestCount).toBe(2));
  expect(screen.getByRole('heading', { name: '팀 세션 초안' })).toBeVisible();
});

it('생성 성공과 목록 재조회 실패를 각각 안내하고 기존 목록을 유지한다', async () => {
  let listRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return listRequestCount === 1
        ? HttpResponse.json(SESSION_LIST)
        : HttpResponse.json({ code: 'PRIVATE', message: 'private' }, { status: 500 });
    }),
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json({ sessionId: 301 }, { status: 201 }),
    ),
  );

  const { user } = await setup(25);
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '세션 추가' }));
  await user.click(screen.getByRole('button', { name: '테스트 세션 저장' }));

  expect(await screen.findByText('세션을 추가했습니다.')).toBeVisible();
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 새로고치지 못했습니다.');
  expect(screen.queryByText('private')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '정규 세션' })).toBeVisible();
});

it('날짜 충돌 시 서버 메시지를 숨기고 입력 초안을 유지한다', async () => {
  let createRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(SESSION_LIST),
    ),
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      createRequestCount += 1;
      return HttpResponse.json(
        { code: 'SESSION_DATE_CONFLICT', message: 'private' },
        { status: 409 },
      );
    }),
  );

  const { user } = await setup(25);
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '세션 추가' }));
  await user.click(screen.getByRole('button', { name: '테스트 세션 저장' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('같은 날짜에 세션이 이미 있습니다.');
  expect(screen.getByText('팀 세션 초안')).toBeVisible();
  expect(screen.queryByText('private')).not.toBeInTheDocument();
  expect(createRequestCount).toBe(1);
});

it('제출 중 중복 요청을 막고 페이지 이동 뒤 완료 UI를 실행하지 않는다', async () => {
  let createRequestCount = 0;
  let listRequestCount = 0;
  let releaseCreate: (() => void) | undefined;
  const createPending = new Promise<void>((resolve) => {
    releaseCreate = resolve;
  });
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return HttpResponse.json(SESSION_LIST);
    }),
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, async () => {
      createRequestCount += 1;
      await createPending;
      return HttpResponse.json({ sessionId: 301 }, { status: 201 });
    }),
  );

  const { user, queryClient, router } = await setup(25, 'team');
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '세션 추가' }));
  const saveButton = screen.getByRole('button', { name: '테스트 세션 저장' });
  await user.click(saveButton);
  await waitFor(() => expect(createRequestCount).toBe(1));
  expect(saveButton).toBeDisabled();
  await user.click(saveButton);
  expect(createRequestCount).toBe(1);

  router.history.push('/moved');
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: '세션 추가' })).not.toBeInTheDocument(),
  );
  releaseCreate?.();
  await waitFor(() =>
    expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('success'),
  );
  await waitFor(() => expect(listRequestCount).toBe(2));
  expect(screen.queryByText('세션을 추가했습니다.')).not.toBeInTheDocument();
  expect(createRequestCount).toBe(1);
});

it('저장 장소·초 단위 시간을 복원하고 전체 본문으로 유형을 바꾼 뒤 현재 필터를 유지한다', async () => {
  let updated = false;
  let requestedPath = '';
  let requestedBody: unknown;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(
        updated
          ? {
              ...SESSION_LIST,
              regularCount: 0,
              teamCount: 2,
              sessions: [UPDATED_TEAM_SESSION, TEAM_SESSION],
            }
          : SESSION_LIST,
      ),
    ),
    http.put(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      async ({ params, request }) => {
        requestedPath = `${String(params.generationId)}/${String(params.sessionId)}`;
        requestedBody = await request.json();
        updated = true;
        return new HttpResponse(null, { status: 204 });
      },
    ),
  );

  const { user } = await setup(25, 'offline');
  const dialog = within(await openEdit(user, '정규 세션'));
  expect(
    dialog.getByText('정규 세션|2026-10-31|14:00:10|18:00:20|서울특별시 중구 세종대로 110'),
  ).toBeVisible();
  await user.click(dialog.getByRole('button', { name: '팀으로 변경 저장' }));

  expect(await screen.findByText(/변경한 유형은 전체 목록에서 확인/)).toBeVisible();
  expect(screen.getByRole('radio', { name: '오프라인' })).toBeChecked();
  expect(await screen.findByText('선택한 유형의 세션이 없습니다.')).toBeVisible();
  expect(requestedPath).toBe('25/101');
  expect(requestedBody).toEqual({
    name: '정규 세션 팀 전환',
    location: null,
    date: '2026-10-31',
    startTime: '14:00:10',
    endTime: '18:00:20',
    type: 'TEAM',
    roadAddress: null,
    detailAddress: null,
    latitude: null,
    longitude: null,
  });
});

it('수정 성공과 목록 재조회 실패를 구분하고 기존 목록을 유지한다', async () => {
  let listRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return listRequestCount === 1
        ? HttpResponse.json(SESSION_LIST)
        : HttpResponse.json({ code: 'PRIVATE', message: 'private' }, { status: 500 });
    }),
    http.put(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openEdit(user, '팀 세션'));
  await user.click(dialog.getByRole('button', { name: '테스트 세션 저장' }));

  expect(await screen.findByText('세션을 수정했습니다.')).toBeVisible();
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 새로고치지 못했습니다.');
  expect(screen.getByRole('heading', { name: '팀 세션' })).toBeVisible();
  expect(screen.queryByText('private')).not.toBeInTheDocument();
});

it('수정 제한 충돌은 서버 메시지를 숨기고 수정 초안을 유지한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(SESSION_LIST),
    ),
    http.put(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, () =>
      HttpResponse.json({ code: 'SESSION_UPDATE_CONFLICT', message: 'private' }, { status: 409 }),
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openEdit(user, '정규 세션'));
  await user.click(dialog.getByRole('button', { name: '테스트 세션 저장' }));

  expect(await dialog.findByRole('alert')).toHaveTextContent('출석이 연결된 세션은');
  expect(dialog.getByText(/정규 세션\|2026-10-31/)).toBeVisible();
  expect(screen.queryByText('private')).not.toBeInTheDocument();
});

it('수정 요청 중 페이지를 이동하면 이전 화면의 완료 알림을 실행하지 않는다', async () => {
  let listRequestCount = 0;
  let updateRequestCount = 0;
  const updatePending = Promise.withResolvers<void>();
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return HttpResponse.json(SESSION_LIST);
    }),
    http.put(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, async () => {
      updateRequestCount += 1;
      await updatePending.promise;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  const { user, queryClient, router } = await setup(25);
  const dialog = within(await openEdit(user, '정규 세션'));
  const saveButton = dialog.getByRole('button', { name: '테스트 세션 저장' });
  await user.click(saveButton);
  await waitFor(() => expect(updateRequestCount).toBe(1));
  expect(saveButton).toBeDisabled();

  router.history.push('/moved');
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: '세션 수정' })).not.toBeInTheDocument(),
  );
  updatePending.resolve();
  await waitFor(() =>
    expect(queryClient.getMutationCache().getAll().at(-1)?.state.status).toBe('success'),
  );
  await waitFor(() => expect(listRequestCount).toBe(2));
  expect(screen.queryByText('세션을 수정했습니다.')).not.toBeInTheDocument();
});
