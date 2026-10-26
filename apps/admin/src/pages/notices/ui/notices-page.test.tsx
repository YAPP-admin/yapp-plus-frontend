/** 목록 데이터·조회 상태·필터 표시와 카드 집계를 화면에서 검증한다. */
import { act, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Providers } from '~/providers';
import * as service from '~/features/notice-management/model/notices';
import { createNoticeStore } from '~/features/notice-management/model/notices.mock';
import { NoticesPage } from './notices-page';
import type { NoticeCategory } from '../model/notice-search';

vi.mock('~/features/notice-management/model/notices', () => ({
  createNotice: vi.fn<typeof service.createNotice>(),
  updateNotice: vi.fn<typeof service.updateNotice>(),
  deleteNotice: vi.fn<typeof service.deleteNotice>(),
  listNotices: vi.fn<typeof service.listNotices>(),
  listNoticeMembers: vi.fn<typeof service.listNoticeMembers>(),
}));
const store = createNoticeStore();
beforeEach(() => {
  vi.stubEnv('DEV', true);
  vi.mocked(service.listNotices).mockResolvedValue(store.listNotices());
  vi.mocked(service.listNoticeMembers).mockResolvedValue(store.listMembers());
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

/** 독립 라우터와 Query 캐시를 사용해 실제 조회 훅으로 화면을 렌더링한다. */
async function renderPage(category: NoticeCategory = 'all') {
  const root = createRootRoute({
    component: () => (
      <Providers>
        <NoticesPage category={category} onCategoryChange={() => undefined} />
      </Providers>
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

it('최신순 공지·전체/필터 개수·대상·읽음 집계와 상세 링크를 표시한다', async () => {
  await renderPage();
  const cards = await screen.findAllByRole('article');
  expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
    '예시 운영 안내',
    '예시 제출 안내',
    '예시 세션 안내',
  ]);
  expect(screen.getByText(/게시 중/)).toHaveTextContent('게시 중 3개');
  const session = within(screen.getByRole('article', { name: '예시 세션 안내' }));
  expect(session.getByText('전체 사용자')).toBeVisible();
  expect(session.getByText('1 / 4명')).toBeVisible();
  expect(session.getByRole('progressbar')).toHaveAttribute('value', '25');
  expect(session.getByRole('link', { name: '예시 세션 안내' })).toHaveAttribute(
    'href',
    '/notices/demo-session',
  );
  expect(screen.getByText('개발용 예시 데이터입니다.')).toBeVisible();
});

it.each(['session', 'submission', 'operation'] as const)(
  '%s 필터는 전체 게시 개수를 유지하고 결과만 줄인다',
  async (category) => {
    await renderPage(category);
    expect(await screen.findAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/게시 중/)).toHaveTextContent('게시 중 3개');
    expect(screen.getByText(/^총/)).toHaveTextContent('총 1개');
  },
);

it.each(['all-empty', 'filter-empty'] as const)('%s 상태를 구별한다', async (mode) => {
  vi.mocked(service.listNotices).mockResolvedValue(
    mode === 'all-empty'
      ? []
      : store.listNotices().filter((notice) => notice.category === 'operation'),
  );
  await renderPage('session');
  expect(
    await screen.findByText(
      mode === 'all-empty' ? '등록된 공지가 없습니다.' : '선택한 종류의 공지가 없습니다.',
    ),
  ).toBeVisible();
});

it('조회 중에는 빈 목록을 표시하지 않는다', async () => {
  vi.mocked(service.listNotices).mockReturnValue(new Promise(() => undefined));
  await renderPage();
  expect(await screen.findByRole('status')).toHaveTextContent('불러오는 중');
  expect(screen.queryByText('등록된 공지가 없습니다.')).not.toBeInTheDocument();
});

it.each(['list', 'members'] as const)(
  '%s 조회 실패를 재시도하면 목록을 복구한다',
  async (source) => {
    const user = userEvent.setup();
    if (source === 'list') {
      vi.mocked(service.listNotices).mockRejectedValueOnce(new Error('실패'));
    } else {
      vi.mocked(service.listNoticeMembers).mockRejectedValueOnce(new Error('실패'));
    }
    await renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다');
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findAllByRole('article')).toHaveLength(3);
  },
);

it('대상 0명은 0%로 표시하며 관리 메뉴에서 수정에 접근한다', async () => {
  const user = userEvent.setup();
  vi.mocked(service.listNoticeMembers).mockResolvedValue([]);
  await renderPage('session');
  expect(await screen.findByRole('progressbar')).toHaveAttribute('value', '0');
  const menu = screen.getByLabelText('예시 세션 안내 관리');
  menu.focus();
  await user.keyboard('{Enter}');
  // happy-dom은 details의 키보드 기본 동작을 구현하지 않아 클릭으로 펼침을 확인한다.
  await user.click(menu);
  expect(screen.getByRole('link', { name: '수정' })).toHaveAttribute(
    'href',
    '/notices/demo-session/edit',
  );
  expect(screen.getByRole('button', { name: '삭제' })).toBeEnabled();
  await user.click(menu);
  expect(menu.closest('details')).not.toHaveAttribute('open');
});

it('프로덕션에서는 모의 조회를 시작하지 않는다', async () => {
  vi.stubEnv('DEV', false);
  await renderPage();
  await waitFor(() => expect(screen.getByText('공지 관리 기능을 준비 중입니다.')).toBeVisible());
  expect(service.listNotices).not.toHaveBeenCalled();
  expect(service.listNoticeMembers).not.toHaveBeenCalled();
});

it('삭제 취소·실패 후 재시도하고 마지막 필터 항목 삭제 시 빈 목록을 표시한다', async () => {
  const mutableStore = createNoticeStore();
  const pending = Promise.withResolvers<void>();
  vi.mocked(service.listNotices).mockImplementation(() =>
    Promise.resolve(mutableStore.listNotices()),
  );
  vi.mocked(service.deleteNotice)
    .mockRejectedValueOnce(new Error('실패'))
    .mockImplementation(async (id) => {
      await pending.promise;
      mutableStore.deleteNotice(id);
    });
  const user = userEvent.setup();
  await renderPage('session');
  const card = await screen.findByRole('article', { name: '예시 세션 안내' });
  await user.click(within(card).getByLabelText('예시 세션 안내 관리'));
  const trigger = within(card).getByRole('button', { name: '삭제' });
  await user.click(trigger);
  const dialog = await screen.findByRole('alertdialog');
  expect(dialog).toHaveAccessibleDescription('“예시 세션 안내” 공지가 삭제됩니다.');
  await user.click(within(dialog).getByRole('button', { name: '취소' }));
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(service.deleteNotice).not.toHaveBeenCalled();

  await user.click(trigger);
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('삭제하지 못했습니다.');
  expect(mutableStore.getNotice('demo-session')).not.toBeNull();
  const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' });
  await user.click(confirm);
  expect(confirm).toBeDisabled();
  await user.click(confirm);
  expect(service.deleteNotice).toHaveBeenCalledTimes(2);
  await act(async () => {
    pending.resolve();
    await pending.promise;
  });
  expect(await screen.findByText('선택한 종류의 공지가 없습니다.')).toBeVisible();
  expect(screen.getByText(/게시 중/)).toHaveTextContent('게시 중 2개');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});
