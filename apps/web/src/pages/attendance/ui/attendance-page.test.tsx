import { Activity } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider } from '@/features/auth';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { apiBaseUrl, server } from '../../../mocks/server';
import { historyFixture, scoreFixture } from '../../../mocks/member-attendance-handlers';
import { historyQueryOptions } from '../model/history-query';
import { AttendancePage } from './attendance-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  replace: vi.fn<() => void>(),
  isActive: true,
}));
vi.mock('@stackflow/react', () => ({
  useFlow: () => navigation,
  useActivity: () => ({ isRoot: true, isActive: navigation.isActive }),
}));
let intersect: (() => void) | undefined;
const disconnect = vi.fn<() => void>();
beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  navigation.isActive = true;
  intersect = undefined;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = () => callback([{ isIntersecting: true }]);
      }
      observe = vi.fn<() => void>();
      disconnect() {
        intersect = undefined;
        disconnect();
      }
    },
  );
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, () => HttpResponse.json(historyFixture)),
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function renderPage() {
  const client = createAppQueryClient();
  const view = render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <AttendancePage />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
    { onCaughtError: vi.fn<(error: unknown) => void>() },
  );
  return { client, ...view };
}
it('실제 집계·전체 배지와 미지원 진행률을 표시한다', async () => {
  renderPage();
  expect(await screen.findByText('12회')).toBeVisible();
  expect(screen.getByText('5회')).toBeVisible();
  for (const label of [
    '출석',
    '지각',
    '결석',
    '조퇴',
    '지각·조퇴',
    '공결',
    '검토중',
    '반려',
    '미제출',
    '미선택',
  ]) {
    expect(screen.getByText(label)).toBeVisible();
  }
  expect(screen.getAllByText('미확정')).toHaveLength(2);
  expect(screen.getByText('—')).toBeVisible();
});
it.each([9, 10])('결석 %i회의 경고 경계를 적용한다', async (absentCount) => {
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-scores/me`, () =>
      HttpResponse.json({ ...scoreFixture, absentCount }),
    ),
  );
  renderPage();
  await screen.findByText('12회');
  await waitFor(() =>
    expect(screen.queryByText(/10번 이상 결석/)).toBe(
      absentCount === 10 ? screen.getByText(/10번 이상 결석/) : null,
    ),
  );
});
it('점수 실패가 목록을 막지 않고 최초 내역 오류는 재시도로 복구한다', async () => {
  let fail = true;
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-scores/me`, () => HttpResponse.error()),
    http.get(`${apiBaseUrl}/api/attendance-history`, () =>
      fail ? HttpResponse.error() : HttpResponse.json(historyFixture),
    ),
  );
  renderPage();
  expect(await screen.findByText('출석 내역을 불러오지 못했어요.')).toBeVisible();
  fail = false;
  await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('세션 1')).toBeVisible();
  expect(await screen.findByRole('button', { name: '경고 정보 다시 시도' })).toBeVisible();
});
it('마지막 빈 페이지에서만 빈 화면을 표시한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, () =>
      HttpResponse.json({ ...historyFixture, items: [] }),
    ),
  );
  renderPage();
  expect(await screen.findByText('아직 출석 내역이 없어요')).toBeVisible();
});
it('빈 중간 페이지 추가 요청은 중복을 막고 실패 시 자동 중단·수동 복구한다', async () => {
  let calls = 0;
  let fail = true;
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, ({ request }) => {
      calls++;
      if (!new URL(request.url).searchParams.has('cursor')) {
        return HttpResponse.json({ ...historyFixture, items: [], nextCursor: 'next' });
      }
      return fail ? HttpResponse.error() : HttpResponse.json(historyFixture);
    }),
  );
  renderPage();
  await waitFor(() => expect(intersect).toBeDefined());
  expect(screen.queryByText('아직 출석 내역이 없어요')).not.toBeInTheDocument();
  act(() => {
    intersect?.();
    intersect?.();
  });
  await screen.findByRole('button', { name: '다시 시도' });
  expect(calls).toBe(2);
  act(() => intersect?.());
  expect(calls).toBe(2);
  fail = false;
  await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('세션 1')).toBeVisible();
  expect(calls).toBe(3);
});
it('재조회 실패는 이전 목록·요약을 보존한다', async () => {
  const { client } = renderPage();
  await screen.findByText('세션 1');
  server.use(http.get(`${apiBaseUrl}/api/attendance-history`, () => HttpResponse.error()));
  await act(async () => {
    await client.invalidateQueries({ queryKey: historyQueryOptions().queryKey });
  });
  expect(await screen.findByText(/이전 내용을 표시/)).toBeVisible();
  expect(screen.getByText('세션 1')).toBeVisible();
  expect(screen.getByText('12회')).toBeVisible();
});

it('비활성 화면에서는 다음 페이지를 관찰하지 않는다', async () => {
  navigation.isActive = false;
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, () =>
      HttpResponse.json({ ...historyFixture, nextCursor: 'next' }),
    ),
  );
  renderPage();
  await screen.findByText('세션 1');
  expect(intersect).toBeUndefined();
});

it('내역 Skeleton·초기 실패 중에도 독립된 결석 경고를 표시한다', async () => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, async () => {
      await pending;
      return HttpResponse.error();
    }),
    http.get(`${apiBaseUrl}/api/attendance-scores/me`, () =>
      HttpResponse.json({ ...scoreFixture, absentCount: 10 }),
    ),
  );
  renderPage();
  expect(await screen.findByRole('status', { name: '출석 내역을 불러오고 있어요' })).toBeVisible();
  expect(await screen.findByText(/10번 이상 결석/)).toBeVisible();
  act(() => finish?.());
  expect(await screen.findByText('출석 내역을 불러오지 못했어요.')).toBeVisible();
  expect(screen.getByText(/10번 이상 결석/)).toBeVisible();
});
it('추가 로딩은 기존 목록과 ProgressCircle을 표시하고 완료 시 제거한다', async () => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, async ({ request }) => {
      if (!new URL(request.url).searchParams.has('cursor')) {
        return HttpResponse.json({
          ...historyFixture,
          items: historyFixture.items.slice(0, 1),
          nextCursor: 'next',
        });
      }
      await pending;
      return HttpResponse.json({ ...historyFixture, items: historyFixture.items.slice(1) });
    }),
  );
  renderPage();
  await screen.findByText('세션 1');
  await waitFor(() => expect(intersect).toBeDefined());
  act(() => intersect?.());
  expect(
    await screen.findByRole('progressbar', { name: '다음 출석 내역을 불러오고 있어요' }),
  ).toBeVisible();
  expect(screen.getByText('세션 1')).toBeVisible();
  act(() => finish?.());
  expect(await screen.findByText('세션 2')).toBeVisible();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

it('화면 숨김은 observer를 해제하고 복귀 시 목록·스크롤을 유지하며 다시 관찰한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/attendance-history`, () =>
      HttpResponse.json({ ...historyFixture, nextCursor: 'next' }),
    ),
  );
  const client = createAppQueryClient();
  const page = (visible: boolean) => (
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <Activity mode={visible ? 'visible' : 'hidden'}>
          <div data-testid="scroll">
            <AttendancePage />
          </div>
        </Activity>
      </NativeAuthSessionProvider>
    </QueryClientProvider>
  );
  const view = render(page(true));
  await screen.findByText('세션 1');
  await waitFor(() => expect(intersect).toBeDefined());
  const scroll = screen.getByTestId('scroll');
  scroll.scrollTop = 120;
  const before = disconnect.mock.calls.length;
  view.rerender(page(false));
  await waitFor(() => expect(disconnect.mock.calls.length).toBeGreaterThan(before));
  expect(intersect).toBeUndefined();
  view.rerender(page(true));
  await waitFor(() => expect(intersect).toBeDefined());
  expect(screen.getByText('세션 1')).toBeVisible();
  expect(screen.getByTestId('scroll')).toBe(scroll);
  expect(scroll.scrollTop).toBe(120);
});
