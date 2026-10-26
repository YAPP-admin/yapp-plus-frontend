/** 작성 기본값과 수정 초기화·재조회 중 입력 보존을 검증한다. */
import { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import * as service from '~/features/notice-management/model/notices';
import { createNoticeStore } from '~/features/notice-management/model/notices.mock';
import { NoticeCreatePage, NoticeEditPage } from './notice-editor-page';

vi.mock('~/features/notice-management/model/notices', () => ({
  getNotice: vi.fn<typeof service.getNotice>(),
  listNotices: vi.fn<typeof service.listNotices>(),
  listNoticeMembers: vi.fn<typeof service.listNoticeMembers>(),
}));

const store = createNoticeStore();

beforeEach(() => {
  vi.stubEnv('DEV', true);
  vi.mocked(service.getNotice).mockImplementation((id) => Promise.resolve(store.getNotice(id)));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

/** 동일한 화면 인스턴스에서 공지 이동과 Query 재조회를 재현한다. */
async function renderPage(create = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  function Page() {
    const [id, setId] = useState('demo-session');

    return (
      <QueryClientProvider client={client}>
        <button onClick={() => setId('demo-submission')}>다른 공지</button>
        {create ? <NoticeCreatePage /> : <NoticeEditPage noticeId={id} />}
      </QueryClientProvider>
    );
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: Page }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);

  return client;
}

it('작성은 빈 제목·본문과 세션·전체 대상으로 시작한다', async () => {
  await renderPage(true);
  expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue('');
  expect(screen.getByRole('radio', { name: '세션' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '전체 사용자' })).toBeChecked();
  expect((await screen.findByRole('textbox', { name: '공지 내용' })).textContent).toBe('');
});

it('재조회 성공·실패·삭제 결과에도 입력을 보존하고 ID 변경 시 새 공지를 표시한다', async () => {
  const client = await renderPage();
  const user = userEvent.setup();

  const title = await screen.findByRole('textbox', { name: '제목' });
  await user.clear(title);
  await user.type(title, '수정 중');

  const body = await screen.findByRole('textbox', { name: '공지 내용' });
  const paragraph = body.querySelector('p');

  if (!paragraph) {
    throw new Error('본문 문단이 필요합니다.');
  }

  paragraph.textContent = '편집 중인 본문';
  await waitFor(() => expect(body).toHaveTextContent('편집 중인 본문'));
  await act(() => client.invalidateQueries());
  expect(title).toHaveValue('수정 중');

  vi.mocked(service.getNotice).mockRejectedValueOnce(new Error('실패'));
  await act(() => client.invalidateQueries());
  expect(title).toHaveValue('수정 중');

  vi.mocked(service.getNotice).mockResolvedValueOnce(null);
  await act(() => client.invalidateQueries());
  expect(body).toHaveTextContent('편집 중인 본문');

  await user.click(screen.getByRole('button', { name: '다른 공지' }));
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue(
      store.getNotice('demo-submission')?.title,
    ),
  );
  expect(screen.getByRole('radio', { name: '제출' })).toBeChecked();
  expect(screen.getByLabelText('마감 날짜 (한국 시간)')).toHaveValue('2026-11-01');
});

it('조회 실패는 재시도로 복구하고 없는 공지는 구별한다', async () => {
  vi.mocked(service.getNotice).mockRejectedValueOnce(new Error('실패'));
  await renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');

  vi.mocked(service.getNotice).mockResolvedValueOnce(null);
  await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('공지를 찾을 수 없습니다.')).toBeVisible();
});
