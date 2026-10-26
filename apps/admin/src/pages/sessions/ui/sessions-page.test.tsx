/** 실제 Query 훅으로 목록 로딩·재시도·빈 상태와 운영 환경 차단을 검증합니다. */
import { useState } from 'react';
import { act, render, screen, within } from '@testing-library/react';
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
import { listSessions } from '../model/sessions';
import { createSessionStore } from '../model/sessions.mock';
import { SessionsPage } from './sessions-page';

vi.mock('../model/sessions', () => ({ listSessions: vi.fn<typeof listSessions>() }));
const list = vi.mocked(listSessions);
const fixtures = createSessionStore().listSessions();

beforeEach(() => {
  vi.stubEnv('DEV', true);
  list.mockResolvedValue(fixtures);
});
afterEach(() => {
  vi.unstubAllEnvs();
  list.mockReset();
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
