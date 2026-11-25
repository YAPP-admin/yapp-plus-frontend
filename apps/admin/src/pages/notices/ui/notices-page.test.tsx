import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { AdminPostListItemResponse } from '@yapp-plus/api/generated';
import { NoticeList } from './notice-list';

const notice: AdminPostListItemResponse = {
  postId: 101,
  title: '세션 공지',
  publishedAt: '2026-11-24T09:00:00Z',
  type: 'SESSION',
  audience: { type: 'GROUP', target: 'ALL_USERS', positions: [] },
  recipientCount: 4,
  readCount: 1,
  deadlineDate: null,
  daysUntilDeadline: null,
};

it('생성 SDK 목록 응답을 종류·읽음 집계·상세 링크로 표시한다', async () => {
  const root = createRootRoute({
    component: () => (
      <NoticeList
        category="all"
        generationId={25}
        notices={[notice]}
        totalPostCount={1}
        hasNextPage={false}
        isFetchingNextPage={false}
        onFetchNextPage={() => undefined}
      />
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  const card = await screen.findByRole('article', { name: '세션 공지' });
  expect(within(card).getByText('세션')).toBeVisible();
  expect(within(card).getByText('1 / 4명')).toBeVisible();
  expect(within(card).getByRole('progressbar')).toHaveAttribute('value', '25');
  expect(within(card).getByRole('link', { name: '세션 공지' })).toHaveAttribute(
    'href',
    '/notices/101',
  );
  expect(screen.queryByText(/게시 중/)).not.toBeInTheDocument();
});
