/** 실제 Query·폼과 메모리 저장소로 목록 상태와 생성 흐름을 검증합니다. */
import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import type { SessionFilter } from '../model/session-search';
import { sessionsQueryOptions } from '../model/session-queries';
import { createSession, listSessions } from '../model/sessions';
import { createSessionStore } from '../model/sessions.mock';
import { SessionsPage } from './sessions-page';

vi.mock('../model/sessions', () => ({
  listSessions: vi.fn<typeof listSessions>(),
  createSession: vi.fn<typeof createSession>(),
}));
const list = vi.mocked(listSessions);
const create = vi.mocked(createSession);
const fixtures = createSessionStore().listSessions();

beforeEach(() => {
  vi.stubEnv('DEV', true);
  list.mockResolvedValue(fixtures);
});
afterEach(() => {
  vi.unstubAllEnvs();
  list.mockReset();
  create.mockReset();
});

async function setup(type: SessionFilter = 'all', cached = false) {
  const client = createAdminQueryClient();
  if (cached) {
    client.setQueryData(sessionsQueryOptions.queryKey, fixtures);
  }
  function Harness() {
    const [filter, setFilter] = useState(type);
    return (
      <QueryClientProvider client={client}>
        <SessionsPage type={filter} onTypeChange={setFilter} />
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

it('조회 중에는 빈 목록이나 0개를 표시하지 않는다', async () => {
  list.mockReturnValue(new Promise(() => undefined));
  await setup();
  expect(await screen.findByRole('status')).toHaveTextContent('세션 목록을 불러오는 중입니다.');
  expect(screen.queryByText(/0개|등록된 세션이 없습니다/)).not.toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

it('실패 안내에서 키보드로 재시도하고 선택한 필터의 목록을 복구한다', async () => {
  list.mockRejectedValueOnce(new Error('secret-response'));
  const user = await setup('team');
  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 불러오지 못했습니다.');
  expect(screen.queryByText(/secret-response/)).not.toBeInTheDocument();
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof listSessions>>>();
  list.mockReturnValueOnce(pending.promise);
  screen.getByRole('button', { name: '다시 시도' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status')).toHaveTextContent('불러오는 중');
  expect(list).toHaveBeenCalledTimes(2);
  await act(async () => {
    pending.resolve(fixtures);
    await pending.promise;
  });
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('팀 세션 1개');
  expect(screen.getByRole('radio', { name: '팀 세션' })).toBeChecked();
});

it('어떤 필터에서도 전체 데이터가 없으면 전체 빈 상태를 안내한다', async () => {
  list.mockResolvedValue([]);
  await setup('offline');
  expect(await screen.findByText('등록된 세션이 없습니다.')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('오프라인 0개');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

it('필터 결과만 비어 있으면 유형 안내를 표시하고 전체 필터로 돌아갈 수 있다', async () => {
  list.mockResolvedValue(fixtures.filter((session) => session.type === 'team'));
  const user = await setup('offline');
  expect(await screen.findByText('선택한 유형의 세션이 없습니다.')).toBeVisible();
  expect(screen.queryByText('등록된 세션이 없습니다.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: '전체' }));
  expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('전체 1개');
  expect(list).toHaveBeenCalledOnce();
});

it('목록을 최신순으로 표시하고 필터 변경 시 개수를 갱신한다', async () => {
  const user = await setup();
  const rows = await screen.findByRole('list', { name: '세션 목록' });
  expect(
    within(rows)
      .getAllByRole('heading')
      .map((heading) => heading.textContent),
  ).toEqual(['개발용 팀 세션', '개발용 오프라인 세션']);
  await user.click(screen.getByRole('radio', { name: '오프라인' }));
  expect(screen.getByRole('status')).toHaveTextContent('오프라인 1개');
  expect(screen.getAllByRole('article')).toHaveLength(1);
});

it.each([false, true])(
  '배포 환경에서도 캐시 유무(%s)와 무관하게 예시 목록과 초기화 안내를 표시한다',
  async (cached) => {
    vi.stubEnv('DEV', false);
    await setup('all', cached);
    expect(await screen.findByRole('list', { name: '세션 목록' })).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(
      screen.getByText('예시 데이터입니다. 변경사항은 새로고침하면 초기화됩니다.'),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  },
);

/** 서비스 경계만 대체하고 생성·조회에는 실제 저장소를 사용합니다. */
function mockStore(empty = false) {
  const store = createSessionStore(empty ? [] : fixtures);
  list.mockImplementation(() => Promise.resolve(store.listSessions()));
  create.mockImplementation((input) => Promise.resolve(store.createSession(input)));
  return store;
}

async function fillTeamSession(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '세션 추가' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(screen.getByRole('dialog')).toHaveAttribute('data-seed-color-mode', 'dark-only');
  await user.click(dialog.getByRole('radio', { name: '팀 세션' }));
  for (const [label, value] of [
    ['세션명', '새 팀 세션'],
    ['날짜 (한국 시간)', '2026-11-01'],
    ['시작 시간', '14:00'],
    ['종료 시간', '17:00'],
  ] as const) {
    fireEvent.change(dialog.getByLabelText(label), { target: { value } });
  }
}

it.each([true, false])(
  '개발 환경 여부(%s)와 무관하게 생성 후 전체 목록·개수를 갱신한다',
  async (dev) => {
    vi.stubEnv('DEV', dev);
    const store = mockStore();
    const user = await setup('offline');
    await screen.findByRole('list');
    await fillTeamSession(user);
    await user.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('radio', { name: '전체' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('전체 3개');
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('새 팀 세션');
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('팀별 자율 장소');
    expect(store.listSessions()[0]?.attendance).toEqual({
      present: 0,
      late: 0,
      absent: 0,
      pending: 0,
      reported: 0,
    });
    expect(create).toHaveBeenCalledOnce();
    expect(list).toHaveBeenCalledTimes(2);
  },
);

it('빈 목록에서도 생성할 수 있고 취소 후 재진입하면 입력을 초기화한다', async () => {
  mockStore(true);
  const user = await setup();
  await screen.findByText('등록된 세션이 없습니다.');
  await fillTeamSession(user);
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(create).not.toHaveBeenCalled();
  expect(list).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: '세션 추가' }));
  expect(screen.getByLabelText('세션명')).toHaveValue('');
  await user.keyboard('{Escape}');
  await fillTeamSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('status')).toHaveTextContent('전체 1개');
  expect(screen.queryByText('등록된 세션이 없습니다.')).not.toBeInTheDocument();
});

it('저장 중 중복 요청을 막고 실패 시 입력·필터를 보존하여 다시 저장한다', async () => {
  mockStore();
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof createSession>>>();
  create.mockReturnValueOnce(pending.promise);
  const user = await setup('offline');
  await screen.findByRole('list');
  await fillTeamSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  expect(screen.getByLabelText('세션명')).toBeDisabled();
  await user.keyboard('{Escape}');
  fireEvent.submit(screen.getByRole('form', { name: '세션 입력' }));
  expect(create).toHaveBeenCalledOnce();
  await act(async () => {
    pending.reject(new Error('secret-response'));
    await expect(pending.promise).rejects.toThrow('secret-response');
  });
  expect(await screen.findByText(/저장하지 못했습니다/)).toBeVisible();
  expect(screen.getByLabelText('세션명')).toHaveValue('새 팀 세션');
  expect(screen.queryByText('secret-response')).not.toBeInTheDocument();
  expect(list).toHaveBeenCalledOnce();
  expect(
    within(screen.getByRole('main', { hidden: true })).getByRole('radio', {
      name: '오프라인',
      hidden: true,
    }),
  ).toBeChecked();
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('status')).toHaveTextContent('전체 3개');
  expect(create).toHaveBeenCalledTimes(2);
});
