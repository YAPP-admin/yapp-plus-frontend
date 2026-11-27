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
              initialValues.startDate,
              initialValues.endDate,
              initialValues.startTime,
              initialValues.endTime,
              initialValues.type === 'regular' ? initialValues.location.roadAddress : '',
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
                  startDate: '2026-11-21',
                  endDate: '2026-11-21',
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
              startDate: initialValues.startDate,
              endDate: initialValues.endDate,
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
  startDate: '2026-10-31',
  endDate: '2026-10-31',
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
    lateCount: 0,
    reportCount: 0,
  },
};
const TEAM_SESSION = {
  ...fakeAdminSessionResponse(),
  sessionId: 102,
  name: '팀 세션',
  location: null,
  startDate: '2026-11-07',
  endDate: '2026-11-07',
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
    lateCount: 0,
    reportCount: 0,
  },
};
const SESSION_LIST = {
  totalCount: 2,
  allCount: 2,
  regularCount: 1,
  teamCount: 1,
  sessions: [REGULAR_SESSION, TEAM_SESSION],
} satisfies SessionListResponse;
const UPDATED_TEAM_SESSION = {
  ...TEAM_SESSION,
  sessionId: 101,
  name: '정규 세션 팀 전환',
  startDate: REGULAR_SESSION.startDate,
  endDate: REGULAR_SESSION.endDate,
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

async function setup(generationId: number, initialType: SessionFilter = 'all') {
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

async function setupGenerationSwitcher() {
  const queryClient = createAdminQueryClient();

  function Harness() {
    const [generationId, setGenerationId] = useState(25);
    const [type, setType] = useState<SessionFilter>('all');

    return (
      <QueryClientProvider client={queryClient}>
        <AdminOverlayProvider>
          <button type="button" onClick={() => setGenerationId(32)}>
            32기로 전환
          </button>
          <SessionsPage type={type} generationId={generationId} onTypeChange={setType} />
        </AdminOverlayProvider>
      </QueryClientProvider>
    );
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: Harness }),
    history: createMemoryHistory({ initialEntries: ['/sessions'] }),
  });
  await router.load();
  const rendered = render(<RouterProvider router={router} />);

  return { user: userEvent.setup(), ...rendered };
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

async function openDelete(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = await screen.findByRole('button', { name: `${name} 관리` });
  await user.click(trigger);
  const menu = await screen.findByRole('menu', { name: `${name} 관리` });
  await user.click(within(menu).getByRole('menuitem', { name: '삭제' }));
  return screen.findByRole('alertdialog', { name: '세션을 삭제할까요?' });
}

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
  await setup(25, 'regular');
  expect(await screen.findByText('등록된 세션이 없습니다.')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('정규 세션 0개');
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

it('기수를 전환하면 진행 중이던 이전 기수 목록을 표시하지 않는다', async () => {
  const oldListRequested = Promise.withResolvers<void>();
  const releaseOldList = Promise.withResolvers<void>();
  const nextGenerationSession = {
    ...REGULAR_SESSION,
    sessionId: 3201,
    name: '32기 정규 세션',
  };
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, async ({ params }) => {
      if (params.generationId === '25') {
        oldListRequested.resolve();
        await releaseOldList.promise;
        return HttpResponse.json(SESSION_LIST);
      }
      return HttpResponse.json({
        ...SESSION_LIST,
        sessions: [nextGenerationSession],
        totalCount: 1,
        allCount: 1,
        regularCount: 1,
        teamCount: 0,
      });
    }),
  );

  const { user } = await setupGenerationSwitcher();
  await oldListRequested.promise;
  await user.click(screen.getByRole('button', { name: '32기로 전환' }));

  expect(await screen.findByRole('heading', { name: '32기 정규 세션' })).toBeVisible();
  releaseOldList.resolve();
  await waitFor(() =>
    expect(screen.queryByRole('heading', { name: '정규 세션' })).not.toBeInTheDocument(),
  );
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
  expect(screen.queryByRole('dialog', { name: '세션 추가' })).not.toBeInTheDocument();
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

  const { user } = await setup(25, 'regular');
  const dialog = within(await openEdit(user, '정규 세션'));
  expect(
    dialog.getByText(
      '정규 세션|2026-10-31|2026-10-31|14:00:10|18:00:20|서울특별시 중구 세종대로 110',
    ),
  ).toBeVisible();
  await user.click(dialog.getByRole('button', { name: '팀으로 변경 저장' }));

  expect(await screen.findByText(/변경한 유형은 전체 목록에서 확인/)).toBeVisible();
  expect(screen.getByRole('radio', { name: '정규 세션' })).toBeChecked();
  expect(await screen.findByText('선택한 유형의 세션이 없습니다.')).toBeVisible();
  expect(requestedPath).toBe('25/101');
  expect(requestedBody).toEqual({
    name: '정규 세션 팀 전환',
    location: null,
    startDate: '2026-10-31',
    endDate: '2026-10-31',
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

it('출석이 시작된 세션은 메뉴에서 삭제 사유와 함께 비활성화한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(SESSION_LIST),
    ),
  );

  const { user } = await setup(25);
  await user.click(await screen.findByRole('button', { name: '정규 세션 관리' }));
  const menu = await screen.findByRole('menu', { name: '정규 세션 관리' });
  expect(within(menu).getByRole('menuitem', { name: /삭제/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  expect(within(menu).getByText('출석이 시작되어 삭제할 수 없습니다.')).toBeVisible();
});

it('삭제 취소에 초기 포커스를 두고 요청 없이 목록 메뉴로 돌아간다', async () => {
  let deleteRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(SESSION_LIST),
    ),
    http.delete(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, () => {
      deleteRequestCount += 1;
      return new HttpResponse(null, { status: 204 });
    }),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  await waitFor(() => expect(dialog.getByRole('button', { name: '취소' })).toHaveFocus());
  expect(dialog.getByText('“팀 세션” 세션이 삭제됩니다.')).toBeVisible();
  await user.click(dialog.getByRole('button', { name: '취소' }));

  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(deleteRequestCount).toBe(0);
});

it('삭제 성공 뒤 재조회한 항목과 집계를 표시하고 완료를 안내한다', async () => {
  let listRequestCount = 0;
  let requestedPath = '';
  const singleTeamList = {
    ...SESSION_LIST,
    totalCount: 1,
    allCount: 1,
    regularCount: 0,
    sessions: [TEAM_SESSION],
  };
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return listRequestCount === 1
        ? HttpResponse.json(singleTeamList)
        : HttpResponse.json({
            ...SESSION_LIST,
            totalCount: 0,
            allCount: 0,
            regularCount: 0,
            teamCount: 0,
            sessions: [],
          });
    }),
    http.delete(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      ({ params }) => {
        requestedPath = `${String(params.generationId)}/${String(params.sessionId)}`;
        return new HttpResponse(null, { status: 204 });
      },
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  await user.click(dialog.getByRole('button', { name: '삭제' }));

  expect(await screen.findByText('세션을 삭제했습니다.')).toBeVisible();
  await waitFor(() => expect(screen.queryByRole('heading', { name: '팀 세션' })).toBeNull());
  expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('전체 0개');
  expect(screen.getByText('등록된 세션이 없습니다.')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('heading', { name: '세션 관리' })).toHaveFocus());
  expect(listRequestCount).toBe(2);
  expect(requestedPath).toBe('25/102');
});

it('삭제 요청 중에는 중복 실행과 다이얼로그 닫기를 막는다', async () => {
  let deleteRequestCount = 0;
  const deletePending = Promise.withResolvers<void>();
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () =>
      HttpResponse.json(SESSION_LIST),
    ),
    http.delete(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      async () => {
        deleteRequestCount += 1;
        await deletePending.promise;
        return new HttpResponse(null, { status: 204 });
      },
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  const deleteButton = dialog.getByRole('button', { name: '삭제' });
  await user.click(deleteButton);
  await waitFor(() => expect(deleteRequestCount).toBe(1));
  expect(deleteButton).toBeDisabled();
  expect(dialog.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('alertdialog', { name: '세션을 삭제할까요?' })).toBeVisible();
  await user.click(deleteButton);
  expect(deleteRequestCount).toBe(1);

  deletePending.resolve();
  expect(await screen.findByText('세션을 삭제했습니다.')).toBeVisible();
});

it('삭제 성공 뒤 목록 재조회가 실패하면 기존 목록과 별도 경고를 유지한다', async () => {
  let listRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return listRequestCount === 1
        ? HttpResponse.json(SESSION_LIST)
        : HttpResponse.json({ code: 'PRIVATE', message: 'private' }, { status: 500 });
    }),
    http.delete(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  await user.click(dialog.getByRole('button', { name: '삭제' }));

  expect(await screen.findByText('세션을 삭제했습니다.')).toBeVisible();
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 새로고치지 못했습니다.');
  expect(screen.getByRole('heading', { name: '팀 세션' })).toBeVisible();
  expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('전체 2개');
  expect(screen.queryByText('private')).not.toBeInTheDocument();
});

it('삭제 시점에 출석이 시작되면 확인 창을 유지하고 최신 목록을 조회한다', async () => {
  let listRequestCount = 0;
  const startedTeamSession = {
    ...TEAM_SESSION,
    attendanceSummary: { ...TEAM_SESSION.attendanceSummary, status: 'STARTED' as const },
  };
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return HttpResponse.json(
        listRequestCount === 1
          ? SESSION_LIST
          : { ...SESSION_LIST, sessions: [REGULAR_SESSION, startedTeamSession] },
      );
    }),
    http.delete(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, () =>
      HttpResponse.json({ code: 'SESSION_DELETE_CONFLICT', message: 'private' }, { status: 409 }),
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  await user.click(dialog.getByRole('button', { name: '삭제' }));

  expect(await dialog.findByRole('alert')).toHaveTextContent('출석이 시작된 세션은');
  expect(dialog.getByRole('button', { name: '삭제' })).toBeEnabled();
  expect(screen.queryByText('private')).not.toBeInTheDocument();
  await waitFor(() => expect(listRequestCount).toBe(2));
});

it('이미 사라진 세션은 확인 창을 닫고 목록 새로고침과 포커스 이동을 안내한다', async () => {
  let listRequestCount = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/sessions`, () => {
      listRequestCount += 1;
      return HttpResponse.json(
        listRequestCount === 1
          ? SESSION_LIST
          : {
              ...SESSION_LIST,
              totalCount: 1,
              allCount: 1,
              teamCount: 0,
              sessions: [REGULAR_SESSION],
            },
      );
    }),
    http.delete(`${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId`, () =>
      HttpResponse.json({ code: 'SESSION_NOT_FOUND', message: 'private' }, { status: 404 }),
    ),
  );

  const { user } = await setup(25);
  const dialog = within(await openDelete(user, '팀 세션'));
  await user.click(dialog.getByRole('button', { name: '삭제' }));

  expect(
    await screen.findByText('삭제할 세션을 찾을 수 없습니다. 목록을 새로고침했습니다.'),
  ).toBeVisible();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('heading', { name: '세션 관리' })).toHaveFocus());
  await waitFor(() => expect(listRequestCount).toBe(2));
  expect(screen.queryByRole('heading', { name: '팀 세션' })).not.toBeInTheDocument();
});
