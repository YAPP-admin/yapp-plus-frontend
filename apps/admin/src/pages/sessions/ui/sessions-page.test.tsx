/** 실제 폼과 Query 캐시를 통해 생성 성공·실패·빈 목록 CTA의 연결을 검증합니다. */
import { selectDate, selectTime } from './session-picker.test-utils';
import { Snackbar } from '@seed-design/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { createSession, listSessions } from '../model/sessions';
import { createSessionStore } from '../model/sessions.mock';
import type { SessionFilter } from '../model/session-search';
import type { Session } from '../model/session';
import { sessionQueries } from '../model/session-queries';
import { SessionsPage } from './sessions-page';

vi.mock('../model/sessions', () => ({
  listSessions: vi.fn<typeof listSessions>(),
  createSession: vi.fn<typeof createSession>(),
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
  return { user: userEvent.setup(), client };
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
