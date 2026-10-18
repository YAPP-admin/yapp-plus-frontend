/** 실제 폼과 Query 캐시를 통해 생성·수정·삭제와 목록 상태의 연결을 검증합니다. */
import { selectDate, selectTime } from './session-picker.test-utils';
import { Snackbar } from '@seed-design/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { createSession, deleteSession, listSessions, updateSession } from '../model/sessions';
import { createSessionStore } from '../model/sessions.mock';
import type { SessionFilter } from '../model/session-search';
import type { Session } from '../model/session';
import { sessionQueries } from '../model/session-queries';
import { SessionsPage } from './sessions-page';

vi.mock('../model/sessions', () => ({
  listSessions: vi.fn<typeof listSessions>(),
  createSession: vi.fn<typeof createSession>(),
  updateSession: vi.fn<typeof updateSession>(),
  deleteSession: vi.fn<typeof deleteSession>(),
}));
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

function PagePreview({ initialType }: { initialType: SessionFilter }) {
  const [type, setType] = useState(initialType);
  return <SessionsPage type={type} onTypeChange={setType} />;
}

function setup(initialType: SessionFilter = 'all', empty = false) {
  const store = createSessionStore(empty ? [] : undefined);
  vi.mocked(listSessions).mockImplementation(() => Promise.resolve(store.listSessions()));
  vi.mocked(createSession).mockImplementation((input) =>
    Promise.resolve(store.createSession(input)),
  );
  vi.mocked(updateSession).mockImplementation((input) =>
    Promise.resolve(store.updateSession(input)),
  );
  vi.mocked(deleteSession).mockImplementation((id) =>
    Promise.resolve().then(() => store.deleteSession(id)),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <Snackbar.RootProvider>
        <PagePreview initialType={initialType} />
        <Snackbar.Region>
          <Snackbar.Renderer />
        </Snackbar.Region>
      </Snackbar.RootProvider>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), client, store };
}

async function fillSession(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('세션명'), '새 정규 세션');
  await user.type(screen.getByLabelText('장소'), '교육장');
  await selectDate(user);
  await selectTime(user, '시작 시간', 14, 0);
  await selectTime(user, '종료 시간', 17, 0);
}

it('생성하면 전체 필터로 전환하고 새 카드와 개수·완료 안내를 표시한다', async () => {
  const { user } = setup('team');
  await screen.findByRole('heading', { name: '개발용 팀 세션' });

  await user.click(screen.getByRole('button', { name: '세션 만들기' }));
  await fillSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByRole('heading', { name: '새 정규 세션' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '개발용 정규 세션' })).toBeVisible();
  expect(screen.getByRole('status', { name: '세션 개수' })).toHaveTextContent('전체 3개');
  expect(screen.getByText('세션을 만들었어요.')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: '세션 만들기' })).toHaveFocus());
});

it('빈 목록 CTA로 열고 취소하거나 첫 세션을 생성할 수 있다', async () => {
  const { user } = setup('all', true);
  const empty = await screen.findByRole('region', { name: '빈 세션 목록' });
  const trigger = within(empty).getByRole('button', { name: '세션 만들기' });

  await user.click(trigger);
  await user.type(screen.getByLabelText('세션명'), '취소할 입력');
  await user.click(screen.getByRole('button', { name: '취소' }));
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.click(trigger);
  expect(screen.getByLabelText('세션명')).toHaveValue('취소할 입력');
  await user.clear(screen.getByLabelText('세션명'));
  await fillSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByRole('heading', { name: '새 정규 세션' })).toBeVisible();
  expect(screen.queryByRole('region', { name: '빈 세션 목록' })).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: '세션 개수' })).toHaveTextContent('전체 1개');
});

it('저장 실패 시 입력을 보존하고 다시 저장하면 한 번만 목록에 추가한다', async () => {
  const { user } = setup();
  vi.mocked(createSession).mockRejectedValueOnce(new Error('저장 실패'));
  await screen.findByRole('heading', { name: '개발용 팀 세션' });

  await user.click(screen.getByRole('button', { name: '세션 만들기' }));
  await fillSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 만들지 못했어요.');
  expect(screen.getByLabelText('세션명')).toHaveValue('새 정규 세션');
  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByRole('heading', { name: '새 정규 세션' })).toBeVisible();
  expect(screen.getByRole('status', { name: '세션 개수' })).toHaveTextContent('전체 3개');
  expect(createSession).toHaveBeenCalledTimes(2);

  await user.click(screen.getByRole('button', { name: '세션 만들기' }));
  expect(screen.getByLabelText('세션명')).toHaveValue('');
  expect(screen.getByLabelText('장소')).toHaveValue('');
});

it('생성 중 늦게 도착한 이전 목록 조회가 새 세션을 지우지 않는다', async () => {
  const { user, client } = setup();
  await screen.findByRole('heading', { name: '개발용 팀 세션' });
  let complete: (sessions: Session[]) => void = vi.fn<(sessions: Session[]) => void>();
  const response = new Promise<Session[]>((resolve) => {
    complete = resolve;
  });
  vi.mocked(listSessions).mockReturnValueOnce(response);
  void client.refetchQueries({ queryKey: sessionQueries.list().queryKey });

  await user.click(screen.getByRole('button', { name: '세션 만들기' }));
  await fillSession(user);
  await user.click(screen.getByRole('button', { name: '저장' }));
  await screen.findByRole('heading', { name: '새 정규 세션' });
  complete([]);

  await waitFor(() =>
    expect(screen.getByRole('status', { name: '세션 개수' })).toHaveTextContent('전체 3개'),
  );
});

it('프로덕션에서는 생성 버튼을 노출하지 않는다', () => {
  vi.stubEnv('DEV', false);
  setup();
  expect(screen.queryByRole('button', { name: '세션 만들기' })).not.toBeInTheDocument();
  expect(createSession).not.toHaveBeenCalled();
});

async function openEdit(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole('button', { name: `${name} 메뉴` }));
  await user.click(await screen.findByRole('menuitem', { name: '세션 정보' }));
  await screen.findByRole('dialog', { name: '세션 수정' });
}

it('수정 성공 시 현재 필터와 집계를 유지하고 목록과 완료 안내를 갱신한다', async () => {
  const { user, store } = setup('team');
  await openEdit(user, '개발용 팀 세션');
  const original = store.listSessions().find((session) => session.type === 'team');
  await user.clear(screen.getByLabelText('세션명'));
  await user.type(screen.getByLabelText('세션명'), '수정한 팀 세션');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByRole('heading', { name: '수정한 팀 세션' })).toBeVisible();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('radio', { name: '팀 세션', checked: true })).toBeChecked();
  expect(screen.getByText('세션을 수정했어요.')).toBeVisible();
  expect(store.listSessions().find((session) => session.id === original?.id)?.attendance).toEqual(
    original?.attendance,
  );
});

it('수정 실패 후 입력을 보존하고 다시 저장할 수 있다', async () => {
  const { user } = setup();
  vi.mocked(updateSession).mockRejectedValueOnce(new Error('저장 실패'));
  await openEdit(user, '개발용 팀 세션');
  await user.clear(screen.getByLabelText('장소'));
  await user.type(screen.getByLabelText('장소'), '변경한 장소');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 수정하지 못했어요.');
  expect(screen.getByLabelText('장소')).toHaveValue('변경한 장소');
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('변경한 장소')).toBeVisible();
});

it('수정 대상이 사라지면 오류를 알리고 목록 새로고침으로 복구한다', async () => {
  const { user, store } = setup('team');
  await openEdit(user, '개발용 팀 세션');
  store.deleteSession('demo-team-session');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 수정하지 못했어요.');
  await user.click(screen.getByRole('button', { name: '닫고 목록 새로고침' }));
  expect(await screen.findByText('조건에 맞는 세션이 없어요')).toBeVisible();
});

it('유형 변경으로 카드가 사라져도 현재 필터를 유지한다', async () => {
  const { user } = setup('team');
  await openEdit(user, '개발용 팀 세션');
  screen.getByRole('combobox', { name: '유형' }).focus();
  await user.keyboard('{ArrowDown}{Home}{Enter}');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByText('조건에 맞는 세션이 없어요')).toBeVisible();
  expect(screen.getByRole('radio', { name: '팀 세션', checked: true })).toBeChecked();
});

async function openDelete(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole('button', { name: `${name} 메뉴` }));
  await user.click(await screen.findByRole('menuitem', { name: '삭제' }));
  return screen.findByRole('alertdialog', { name: '세션을 삭제할까요?' });
}

it('삭제 확인에서 대상명을 안내하고 취소하면 목록을 유지한다', async () => {
  const { user } = setup();
  const dialog = await openDelete(user, '개발용 팀 세션');
  expect(within(dialog).getByText(/개발용 팀 세션.*관련 출석 기록/)).toBeVisible();
  await user.click(within(dialog).getByRole('button', { name: '취소' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '개발용 팀 세션' })).toBeVisible();
  expect(deleteSession).not.toHaveBeenCalled();
});

it('삭제 성공 시 해당 카드와 개수를 갱신하고 마지막 항목은 전체 빈 상태로 표시한다', async () => {
  const { user } = setup();
  await openDelete(user, '개발용 팀 세션');
  await user.click(screen.getByRole('button', { name: '삭제' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(screen.queryByRole('heading', { name: '개발용 팀 세션' })).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: '세션 개수' })).toHaveTextContent('전체 1개');
  expect(screen.getByText('세션을 삭제했어요.')).toBeVisible();

  await openDelete(user, '개발용 정규 세션');
  await user.click(screen.getByRole('button', { name: '삭제' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(screen.getAllByRole('button', { name: '세션 만들기' })).toHaveLength(2);
});

it('삭제 실패 시 대상을 유지하고 재시도 성공 후에도 현재 필터를 유지한다', async () => {
  const { user } = setup('team');
  vi.mocked(deleteSession).mockRejectedValueOnce(new Error('삭제 실패'));
  await openDelete(user, '개발용 팀 세션');
  await user.click(screen.getByRole('button', { name: '삭제' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 삭제하지 못했어요.');
  expect(screen.getByRole('alertdialog')).toHaveTextContent('개발용 팀 세션');
  await user.click(screen.getByRole('button', { name: '다시 삭제' }));
  expect(await screen.findByText('조건에 맞는 세션이 없어요')).toBeVisible();
  expect(screen.getByRole('radio', { name: '팀 세션', checked: true })).toBeChecked();
});

it('삭제 중에는 중복 제출과 취소·Esc 닫기를 막는다', async () => {
  const { user, store } = setup();
  let complete!: () => void;
  vi.mocked(deleteSession).mockImplementationOnce(
    (id) =>
      new Promise<void>((resolve) => {
        complete = () => {
          store.deleteSession(id);
          resolve();
        };
      }),
  );
  await openDelete(user, '개발용 팀 세션');
  const submit = screen.getByRole('button', { name: '삭제' });
  await user.click(submit);
  expect(submit).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.click(submit);
  await user.keyboard('{Escape}');
  expect(screen.getByRole('alertdialog')).toBeVisible();
  expect(deleteSession).toHaveBeenCalledTimes(1);
  complete();
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
});

it('삭제 대상이 이미 사라지면 오류를 알리고 목록 새로고침으로 복구한다', async () => {
  const { user, store } = setup('team');
  await openDelete(user, '개발용 팀 세션');
  store.deleteSession('demo-team-session');
  await user.click(screen.getByRole('button', { name: '삭제' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 삭제하지 못했어요.');
  await user.click(screen.getByRole('button', { name: '닫고 목록 새로고침' }));
  expect(await screen.findByText('조건에 맞는 세션이 없어요')).toBeVisible();
});
