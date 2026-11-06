import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { find4Options } from '@yapp-plus/api/generated';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { apiBaseUrl, server } from '../../../mocks/server';
import { createSessionHandlers, scheduleFixture } from '../../../mocks/session-handlers';
import { SchedulePage } from './schedule-page';

const response = {
  ...scheduleFixture,
  sessions: [
    {
      sessionId: 2,
      name: '기획 세션',
      date: '2026-11-07',
      dayOfWeek: 'SATURDAY',
      location: '커뮤니티홀',
      startTime: '13:30:00',
      endTime: '18:00:00',
      type: 'REGULAR',
    },
    {
      sessionId: 1,
      name: '팀 세션',
      date: '2026-11-14',
      dayOfWeek: 'SATURDAY',
      location: null,
      startTime: '13:00',
      endTime: '17:00',
      type: 'TEAM',
    },
  ],
};
const url = `${apiBaseUrl}/api/generations/current/sessions`;

beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  server.use(http.get(url, () => HttpResponse.json(response)));
});
afterEach(() => {
  onlineManager.setOnline(true);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function renderPage(native = false) {
  const client = createAppQueryClient();
  if (native) {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
    client.setQueryData([...nativeSessionQueryOptions(true).queryKey], {
      status: 'SIGNED_IN',
      session: {
        userId: 1,
        sessionId: 'test-session',
        tokenVersion: 1,
        accessToken: 'test-token',
        expiresAt: 9999999999,
      },
    });
  }
  const rendered = render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <SchedulePage />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
  return { client, ...rendered };
}

it('로딩 후 서버 순서·분·장소·정규 세션 칩을 표시한다', async () => {
  server.use(
    http.get(url, async () => {
      await delay(60);
      return HttpResponse.json(response);
    }),
  );
  renderPage();
  expect(await screen.findByRole('status')).toHaveTextContent('일정을 불러오고 있어요…');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  const list = await screen.findByRole('list', { name: '세션 일정 목록' });
  expect(
    within(list)
      .getAllByRole('article')
      .map((item) => within(item).getByRole('heading').textContent),
  ).toEqual(['기획 세션', '팀 세션']);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText('오후 1시 30분 ~ 오후 6시')).toBeVisible();
  expect(screen.getByText('-')).toBeVisible();
  expect(screen.getAllByText('정규 세션')).toHaveLength(1);
});

it('빈 목록을 오류와 구분한다', async () => {
  server.use(http.get(url, () => HttpResponse.json({ ...response, sessions: [] })));
  renderPage();
  expect(await screen.findByText('등록된 세션 일정이 없어요')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('최초 실패 후 키보드로 재시도할 수 있다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(http.get(url, () => HttpResponse.json({ code: 'FAILED' }, { status: 500 })));
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('예상하지 못한 오류가 발생했습니다.');
  server.use(http.get(url, () => HttpResponse.json(response)));
  await user.tab();
  expect(screen.getByRole('button', { name: '다시 시도' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('기획 세션')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('재조회 실패 시 목록을 유지하고 재시도 요청을 공유한다', async () => {
  const user = userEvent.setup();
  const { client } = renderPage();
  await screen.findByText('기획 세션');
  server.use(http.get(url, () => HttpResponse.json({ code: 'FAILED' }, { status: 500 })));
  await act(() => client.invalidateQueries({ queryKey: find4Options().queryKey }));
  expect(await screen.findByRole('alert')).toHaveTextContent('이전 내용을 표시하고 있어요');
  expect(screen.getByText('기획 세션')).toBeVisible();
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let requests = 0;
  server.use(
    http.get(url, async () => {
      requests += 1;
      await pending;
      return HttpResponse.json(response);
    }),
  );
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(requests).toBe(1);
  finish?.();
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

it('비목업 브라우저에서는 API를 호출하지 않는다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  const request = vi.fn<() => void>();
  server.use(
    http.get(url, () => {
      request();
      return HttpResponse.json(response);
    }),
  );
  renderPage();
  expect(await screen.findByText('일정은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.')).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});

it('로그인된 WebView는 Provider 토큰으로 조회한다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  let authorization: string | null = null;
  server.use(
    http.get(url, ({ request }) => {
      authorization = request.headers.get('Authorization');
      return HttpResponse.json(response);
    }),
  );
  renderPage(true);
  expect(await screen.findByText('기획 세션')).toBeVisible();
  expect(authorization).toBe('Bearer test-token');
});

it('시간 경과만으로 바꾸지 않고 재조회 시 지난 일정 표시를 갱신한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-07T08:59:59.900Z'));
  const { client } = renderPage();
  const item = await screen.findByRole('article', { name: '11.7 (토) 기획 세션' });
  vi.setSystemTime(new Date('2026-11-07T09:00:00Z'));
  expect(item).toHaveAccessibleName('11.7 (토) 기획 세션');
  await act(() => client.invalidateQueries({ queryKey: find4Options().queryKey }));
  await waitFor(() => expect(item).toHaveAccessibleName('11.7 (토) 기획 세션 (종료)'));
});

it('개발용 오류 시나리오에서 재시도하면 정상 목록으로 복구한다', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(...createSessionHandlers(apiBaseUrl, 'error'));
  const user = userEvent.setup();
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('예상하지 못한 오류가 발생했습니다.');
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('list', { name: '세션 일정 목록' })).toBeVisible();
});

it('개발용 빈 시나리오에서 빈 화면을 표시한다', async () => {
  server.use(...createSessionHandlers(apiBaseUrl, 'empty'));
  renderPage();
  expect(await screen.findByText('등록된 세션 일정이 없어요')).toBeVisible();
});

it('네트워크 오류 후 연결이 복구되면 기존 목록을 유지한 채 자동 재조회한다', async () => {
  const { client } = renderPage();
  await screen.findByText('기획 세션');
  server.use(http.get(url, () => HttpResponse.error()));
  await act(() => client.invalidateQueries({ queryKey: find4Options().queryKey }));
  expect(await screen.findByRole('alert')).toHaveTextContent('이전 내용을 표시하고 있어요');
  expect(screen.getByText('기획 세션')).toBeVisible();

  act(() => onlineManager.setOnline(false));
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        sessions: [{ ...response.sessions[0], name: '복구된 일정' }],
      }),
    ),
  );
  act(() => onlineManager.setOnline(true));
  expect(await screen.findByText('복구된 일정')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
