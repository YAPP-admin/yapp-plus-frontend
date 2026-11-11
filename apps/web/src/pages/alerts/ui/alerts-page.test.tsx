import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { AlertsPage } from './alerts-page';

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
  useActivity: () => ({ isActive: true, isRoot: true }),
  useFlow: () => ({
    pop: vi.fn<() => void>(),
    replace: vi.fn<(name: string, params: object) => void>(),
  }),
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
  return render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <ScreenActiveContext value>
          <AlertsPage />
        </ScreenActiveContext>
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
}

it('일반 알림을 표시하고 POST 알림만 공지 상세 링크로 연결한다', async () => {
  renderPage();
  const list = await screen.findByRole('list', { name: '알림 목록' });
  expect(within(list).getByText('내일 오후 2시, 정기 세션이 열려요.')).toBeVisible();
  expect(within(list).getByText('11월 6일')).toBeVisible();
  expect(screen.getByRole('link', { name: /공지 알림: 새 공지가 올라왔어요/ })).toHaveAttribute(
    'href',
    '/notices/2',
  );
  expect(screen.queryByRole('link', { name: /정기 세션/ })).not.toBeInTheDocument();
});

it('관찰 지점에서 다음 알림을 이어 붙인다', async () => {
  renderPage();
  await screen.findByText('내일 오후 2시, 정기 세션이 열려요.');
  act(() => observer.trigger?.());
  expect(await screen.findByText('이번 주 세션은 3층 세미나실에서 진행해요.')).toBeVisible();
});

it('빈 목록을 안내한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/users/me/notifications`, () =>
      HttpResponse.json({ items: [], nextCursor: null }),
    ),
  );
  renderPage();
  expect(await screen.findByText('아직 알림이 없어요')).toBeVisible();
});

it('초기 조회 오류를 재시도로 복구한다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const url = `${apiBaseUrl}/api/users/me/notifications`;
  server.use(http.get(url, () => HttpResponse.json({ code: 'FAILED' }, { status: 503 })));
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('알림을 불러오지 못했어요');
  server.use(http.get(url, () => HttpResponse.json({ items: [], nextCursor: null })));
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('아직 알림이 없어요')).toBeVisible();
});

it('로그인하지 않은 브라우저에서는 목록을 조회하지 않는다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  renderPage();

  expect(await screen.findByText('알림은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.')).toBeVisible();
});
