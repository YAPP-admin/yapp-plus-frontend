/** 저장 실패·중복 요청·첨부 검사와 성공 후 상세 이동을 실제 화면 흐름으로 검증한다. */
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useParams,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as service from '~/features/notice-management/model/notices';
import { createNoticeStore } from '~/features/notice-management/model/notices.mock';
import { NoticeDetailPage } from '~/pages/notice-detail/ui/notice-detail-page';
import { NoticeCreatePage, NoticeEditPage } from './notice-editor-page';

vi.mock('~/features/notice-management/model/notices', () => ({
  getNotice: vi.fn<typeof service.getNotice>(),
  listNotices: vi.fn<typeof service.listNotices>(),
  listNoticeMembers: vi.fn<typeof service.listNoticeMembers>(),
  createNotice: vi.fn<typeof service.createNotice>(),
  updateNotice: vi.fn<typeof service.updateNotice>(),
  deleteNotice: vi.fn<typeof service.deleteNotice>(),
}));

beforeEach(() => vi.stubEnv('DEV', true));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

/** 이동한 공지 ID로 실제 상세 화면을 표시한다. */
function SavedNotice() {
  const { noticeId = '' } = useParams({ strict: false });
  return <NoticeDetailPage noticeId={noticeId} tab="readers" />;
}

/** 저장 후 실제 상세 페이지를 조회할 수 있는 최소 라우트와 독립 캐시를 만든다. */
async function renderEditor(edit: boolean) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        <Outlet />
      </QueryClientProvider>
    ),
  });
  const editor = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (edit ? <NoticeEditPage noticeId="demo-session" /> : <NoticeCreatePage />),
  });
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/notices/$noticeId',
    component: SavedNotice,
  });
  const router = createRouter({
    routeTree: root.addChildren([editor, detail]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

it.each([false, true])(
  '수정 여부 %s: 실패한 입력·첨부를 보존하고 중복 없이 저장하여 상세로 이동한다',
  async (edit) => {
    const store = createNoticeStore();
    const saving = Promise.withResolvers<void>();
    const decoding = Promise.withResolvers<Pick<ImageBitmap, 'close'>>();
    vi.stubGlobal('createImageBitmap', () => decoding.promise);
    vi.mocked(service.getNotice).mockImplementation((id) => Promise.resolve(store.getNotice(id)));
    vi.mocked(service.listNoticeMembers).mockResolvedValue(store.listMembers());
    vi.mocked(service.createNotice)
      .mockRejectedValueOnce(new Error('실패'))
      .mockImplementation(async (input) => {
        await saving.promise;
        return store.createNotice(input);
      });
    vi.mocked(service.updateNotice)
      .mockRejectedValueOnce(new Error('실패'))
      .mockImplementation(async (id, input) => {
        await saving.promise;
        return store.updateNotice(id, input);
      });
    const save = edit ? service.updateNotice : service.createNotice;
    const router = await renderEditor(edit);
    const user = userEvent.setup();
    const title = await screen.findByRole('textbox', { name: '제목' });
    await user.clear(title);
    await user.type(title, '저장할 공지');
    const button = screen.getByRole('button', { name: edit ? '수정 저장' : '공지 등록' });
    const body = await screen.findByRole('textbox', { name: '공지 내용' });
    for (const node of within(body).getAllByRole('paragraph')) {
      node.textContent = '';
    }
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('공지 내용을 입력하세요.');
    expect(save).not.toHaveBeenCalled();
    const paragraph = within(body).getAllByRole('paragraph')[0];
    if (!paragraph) {
      throw new Error('본문 문단이 없습니다.');
    }
    paragraph.textContent = '저장할 본문';
    await waitFor(() => expect(body).toHaveTextContent('저장할 본문'));
    await user.click(screen.getByRole('button', { name: '이미지 추가' }));
    await user.upload(
      screen.getByLabelText('첨부 이미지'),
      new File(['image'], '추가.PNG', { type: 'image/png' }),
    );
    expect(button).toBeDisabled();
    await act(async () => {
      decoding.resolve({ close: () => {} });
      await decoding.promise;
    });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('입력을 유지');
    expect(title).toHaveValue('저장할 공지');
    expect(body).toHaveTextContent('저장할 본문');
    expect(screen.getByRole('img', { name: '추가.PNG' })).toBeVisible();
    expect(store.getNotice('demo-session')?.attachments).toHaveLength(1);

    await user.click(screen.getByRole('link', { name: /돌아가기/ }));
    const leaveDialog = await screen.findByRole('alertdialog');
    await user.click(within(leaveDialog).getByRole('button', { name: '계속 작성' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    await user.click(button);
    expect(button).toBeDisabled();
    expect(title).toBeDisabled();
    expect(screen.getByRole('region', { name: '공지 내용' })).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: '추가.PNG 제거' })).toBeDisabled();
    await user.click(button);
    expect(save).toHaveBeenCalledTimes(2);
    await act(async () => {
      saving.resolve();
      await saving.promise;
    });
    expect(await screen.findByRole('heading', { name: '공지 상세' })).toBeVisible();
    expect(await screen.findByRole('document', { name: '공지 본문' })).toHaveTextContent(
      '저장할 본문',
    );
    expect(screen.getByRole('img', { name: '추가.PNG' })).toBeVisible();
    const saved = store.listNotices().find((notice) => notice.title === '저장할 공지');
    expect(saved?.attachments).toHaveLength(edit ? 2 : 1);
    expect(router.state.location.pathname).toBe(`/notices/${saved?.id}`);
    expect(saved).toMatchObject(
      edit
        ? { id: 'demo-session', createdAt: '2026-10-20T00:00:00.000Z' }
        : { title: '저장할 공지' },
    );
  },
);
