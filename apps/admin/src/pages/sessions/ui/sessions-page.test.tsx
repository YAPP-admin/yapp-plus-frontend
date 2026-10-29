/** 실제 Query·폼과 메모리 저장소로 목록 상태와 생성·수정 흐름을 검증합니다. */
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
import { sessionsQueryOptions } from '~/features/session-management';
import { createSession, listSessions, updateSession } from '~/features/session-management/service';
import { lookupCoordinates } from '../model/location/coordinates';
import { createSessionStore } from '~/features/session-management/testing';
import { AdminOverlayProvider } from '../../../app/ui/admin-overlay-provider';
import { SessionsPage } from './sessions-page';

// 폼·목록 테스트는 저장 계약에 집중하고 실제 Picker 조작은 별도 테스트에서 검증합니다.
vi.mock('./session-schedule-field', () => ({
  SessionScheduleField: ({
    label,
    value,
    disabled,
    error,
    onChange,
  }: {
    label: string;
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span role="alert">{error}</span>}
    </label>
  ),
}));

vi.mock('~/features/session-management/service', () => ({
  listSessions: vi.fn<typeof listSessions>(),
  createSession: vi.fn<typeof createSession>(),
  updateSession: vi.fn<typeof updateSession>(),
}));
vi.mock('../model/location/coordinates', () => ({
  lookupCoordinates: vi.fn<typeof lookupCoordinates>(),
}));
// 지도 대신 저장 좌표의 복원과 외부 좌표 재조회 여부를 검증합니다.
vi.mock('./session-location-map', () => ({
  SessionLocationMap: ({ position }: { position: { latitude: number; longitude: number } }) => (
    <p>
      저장 좌표: {position.latitude}, {position.longitude}
    </p>
  ),
}));
const update = vi.mocked(updateSession);
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
  update.mockReset();
  vi.mocked(lookupCoordinates).mockReset();
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
        <AdminOverlayProvider>
          <SessionsPage type={filter} onTypeChange={setFilter} />
        </AdminOverlayProvider>
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
  update.mockImplementation((id, input) => Promise.resolve(store.updateSession(id, input)));
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
      pending: 40,
      reported: 0,
    });
    expect(screen.getAllByRole('article')[0]).toHaveTextContent(/미처리\s*40\s*명/);
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

it('생성 Mutation 실패 시 입력·필터를 보존하고 재시도 성공을 반영한다', async () => {
  mockStore();
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof createSession>>>();
  create.mockReturnValueOnce(pending.promise);
  const user = await setup('offline');
  await screen.findByRole('list');
  await fillTeamSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));
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

/** 정보 메뉴부터 실제 수정 폼까지 키보드로 진입합니다. */
async function openEdit(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = await screen.findByLabelText(`${name} 정보`);
  trigger.focus();
  await user.keyboard('{Enter}');
  const menu = await screen.findByRole('menu', { name: `${name} 정보` });
  expect(within(menu).getByRole('menuitem', { name: '수정' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('dialog', { name: '세션 수정' })).toBeVisible();
}

it('저장된 오프라인 일정·주소·좌표를 복원하고 ID·집계·필터를 보존해 수정한다', async () => {
  const store = mockStore();
  const previous = fixtures.find((session) => session.type === 'offline');
  if (!previous) {
    throw new Error('오프라인 예시 세션이 필요합니다.');
  }
  const user = await setup('offline');
  await openEdit(user, previous.name);
  expect(screen.getByLabelText('날짜 (한국 시간)')).toHaveValue(previous.date);
  expect(screen.getByLabelText('시작 시간')).toHaveValue(previous.startTime);
  expect(screen.getByLabelText('종료 시간')).toHaveValue(previous.endTime);
  expect(screen.getByText(`선택한 주소: ${previous.location.roadAddress}`)).toBeVisible();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue(previous.location.detailAddress);
  expect(screen.getByText('저장 좌표: 37.5665, 126.978')).toBeVisible();
  expect(lookupCoordinates).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('세션명'), { target: { value: '수정한 오프라인' } });
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('radio', { name: '오프라인' })).toBeChecked();
  expect(screen.getByText('오프라인 1개')).toBeVisible();
  expect(screen.getByRole('heading', { name: '수정한 오프라인' })).toBeVisible();
  expect(store.listSessions().find((session) => session.id === previous.id)).toEqual({
    ...previous,
    name: '수정한 오프라인',
  });
  expect(update).toHaveBeenCalledOnce();
  expect(create).not.toHaveBeenCalled();
  expect(
    within(screen.getByRole('region', { name: '어드민 알림' })).getByRole('status'),
  ).toHaveTextContent('세션을 수정했습니다.');
});

it('수정 취소 후 다시 열면 저장값을 복원한다', async () => {
  mockStore();
  const user = await setup();
  await openEdit(user, '개발용 팀 세션');
  fireEvent.change(screen.getByLabelText('장소 안내 (선택)'), {
    target: { value: '미저장 초안' },
  });
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(update).not.toHaveBeenCalled();
  await openEdit(user, '개발용 팀 세션');
  expect(screen.getByLabelText('장소 안내 (선택)')).toHaveValue('');
});

it('유형 변경으로 필터에서 사라지면 현재 필터와 빈 상태·완료 안내를 유지한다', async () => {
  const store = mockStore();
  const user = await setup('offline');
  await openEdit(user, '개발용 오프라인 세션');
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  fireEvent.change(screen.getByLabelText('장소 안내 (선택)'), {
    target: { value: '변경한 팀 장소' },
  });
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('radio', { name: '오프라인' })).toBeChecked();
  expect(screen.getByText('오프라인 0개')).toBeVisible();
  expect(screen.getByText('선택한 유형의 세션이 없습니다.')).toBeVisible();
  const notification = within(screen.getByRole('region', { name: '어드민 알림' }));
  expect(notification.getByRole('status')).toHaveTextContent('변경한 유형은 전체 목록');
  expect(
    within(screen.getByRole('main')).queryByText(/변경한 유형은 전체 목록/),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: '전체' }));
  expect(screen.getByText('전체 2개')).toBeVisible();
  expect(
    store.listSessions().find((session) => session.id === 'demo-offline-session')?.location,
  ).toEqual({ guide: '변경한 팀 장소' });
  await openEdit(user, '개발용 오프라인 세션');
  expect(screen.getByRole('radio', { name: '팀 세션' })).toBeChecked();
  expect(screen.getByLabelText('장소 안내 (선택)')).toHaveValue('변경한 팀 장소');
});

it('수정한 날짜로 목록을 다시 정렬하고 재진입 시 마지막 저장값을 표시한다', async () => {
  mockStore();
  const user = await setup();
  await openEdit(user, '개발용 오프라인 세션');
  fireEvent.change(screen.getByLabelText('날짜 (한국 시간)'), { target: { value: '2026-12-31' } });
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getAllByRole('article')[0]).toHaveTextContent('개발용 오프라인 세션');
  await openEdit(user, '개발용 오프라인 세션');
  expect(screen.getByLabelText('날짜 (한국 시간)')).toHaveValue('2026-12-31');
});

it('수정 Mutation 실패 시 목록·필터를 유지하고 재시도 성공을 반영한다', async () => {
  mockStore();
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof updateSession>>>();
  update.mockReturnValueOnce(pending.promise);
  const user = await setup('team');
  await openEdit(user, '개발용 팀 세션');
  fireEvent.change(screen.getByLabelText('장소 안내 (선택)'), {
    target: { value: '재시도할 장소' },
  });
  await user.click(screen.getByRole('button', { name: '저장' }));
  await act(async () => {
    pending.reject(new Error('수정할 세션을 찾을 수 없습니다.'));
    await expect(pending.promise).rejects.toThrow('수정할 세션을 찾을 수 없습니다.');
  });
  expect(await screen.findByText(/저장하지 못했습니다/)).toBeVisible();
  expect(screen.getByLabelText('장소 안내 (선택)')).toHaveValue('재시도할 장소');
  expect(list).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('재시도할 장소')).toBeVisible();
  expect(screen.getByRole('radio', { name: '팀 세션' })).toBeChecked();
  expect(update).toHaveBeenCalledTimes(2);
});
