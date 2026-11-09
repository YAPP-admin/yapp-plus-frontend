import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { NoticesPage } from './notices-page';

vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    activityName: _activityName,
    activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName: string;
    activityParams: { noticeId: string };
  }) => (
    <a {...props} href={`/notices/${activityParams.noticeId}`}>
      {children}
    </a>
  ),
}));

const observer = vi.hoisted(() => ({ trigger: undefined as (() => void) | undefined }));
vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isActive: true }),
}));

beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  observer.trigger = undefined;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        observer.trigger = () => callback([{ isIntersecting: true }]);
      }
      observe = vi.fn<() => void>();
      disconnect = () => {
        observer.trigger = undefined;
      };
    },
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function renderPage() {
  const client = createAppQueryClient();
  const content = (active: boolean) => (
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <ScreenActiveContext value={active}>
          <ControlledNotices />
        </ScreenActiveContext>
      </NativeAuthSessionProvider>
    </QueryClientProvider>
  );
  const view = render(content(true));
  return { client, ...view, setActive: (active: boolean) => view.rerender(content(active)) };
}

function ControlledNotices() {
  const [category, setCategory] = useState<'ALL' | 'SESSION' | 'ASSIGNMENT' | 'OPERATION'>('ALL');
  return <NoticesPage category={category} onCategoryChange={setCategory} />;
}

it('서버 공지를 표시하고 상세 링크를 연결한다', async () => {
  renderPage();
  const list = await screen.findByRole('list', { name: '공지사항 목록' });
  expect(within(list).getByRole('heading', { name: '6주차 세션 안내' })).toBeVisible();
  expect(within(list).getByText('2026.11.07.(토)')).toBeVisible();
  expect(screen.getByRole('link', { name: '세션 공지: 6주차 세션 안내' })).toHaveAttribute(
    'href',
    '/notices/1',
  );
});

it('탭 전환 시 유형별 API 결과를 새로 표시한다', async () => {
  const user = userEvent.setup();
  renderPage();
  await screen.findByText('6주차 세션 안내');
  await user.click(screen.getByRole('tab', { name: '과제' }));
  const list = await screen.findByRole('list', { name: '공지사항 목록' });
  expect(within(list).getByText('사용자 테스트 결과 제출')).toBeVisible();
  expect(within(list).queryByText('6주차 세션 안내')).not.toBeInTheDocument();
});

it('관찰 지점에서 다음 페이지를 이어 붙인다', async () => {
  renderPage();
  await screen.findByText('6주차 세션 안내');
  act(() => observer.trigger?.());
  expect(await screen.findByText('5주차 세션 안내')).toBeVisible();
  act(() => observer.trigger?.());
  await waitFor(() => expect(screen.getByText('3주차 세션 안내')).toBeVisible());
});

it('초기 조회 오류를 ResultSection의 재시도로 복구한다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const url = `${apiBaseUrl}/api/posts`;
  server.use(http.get(url, () => HttpResponse.json({ code: 'FAILED' }, { status: 500 })));
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('공지사항을 불러오지 못했어요');
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        totalPostCount: 0,
        items: [],
        nextCursor: null,
      }),
    ),
  );
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('아직 작성된 공지사항이 없어요')).toBeVisible();
});

it('비활성 탭에서는 추가 조회 관찰을 해제하고 복귀하면 다시 연결한다', async () => {
  const { setActive } = renderPage();
  await screen.findByText('6주차 세션 안내');
  await waitFor(() => expect(observer.trigger).toBeDefined());
  setActive(false);
  expect(observer.trigger).toBeUndefined();
  expect(screen.queryByText('5주차 세션 안내')).not.toBeInTheDocument();
  setActive(true);
  await waitFor(() => expect(observer.trigger).toBeDefined());
  act(() => observer.trigger?.());
  expect(await screen.findByText('5주차 세션 안내')).toBeVisible();
});
