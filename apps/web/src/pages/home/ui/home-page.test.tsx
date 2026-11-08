import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from '@yapp-plus/ui';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { find3Options } from '@yapp-plus/api/generated';
import { http, HttpResponse, delay } from 'msw';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { apiBaseUrl, server } from '../../../mocks/server';
import { memberNoticeFixture } from '../../../mocks/member-notice-handlers';
import { currentWeekFixture } from '../../../mocks/session-handlers';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './home-page';

const mockPush = vi.fn<(activityName: string, params: object) => void>();
vi.mock('@stackflow/react', () => ({ useFlow: () => ({ push: mockPush }) }));
vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({
    tab,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { tab: string }) => (
    <a {...props} href={tab === 'home' ? '/' : `/${tab}`}>
      {children}
    </a>
  ),
}));
vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    activityName: _activityName,
    activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName?: string;
    activityParams: { noticeId: string };
  }) => (
    <a {...props} href={`/notices/${activityParams.noticeId}`}>
      {children}
    </a>
  ),
}));

const url = `${apiBaseUrl}/api/sessions/current-week`;
const response = {
  ...currentWeekFixture,
  session: {
    ...currentWeekFixture.session,
    name: '설계 리뷰',
    location: null,
    attendanceStatus: 'AVAILABLE',
  },
};
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T15:00:00Z'));
  vi.stubEnv('VITE_API_MOCKING', 'true');
  server.use(http.get(url, () => HttpResponse.json(response)));
});
function renderHome(props: React.ComponentProps<typeof HomePage> = {}, native = false) {
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
  const result = render(
    <QueryClientProvider client={client}>
      <SnackbarProvider>
        {native ? (
          <NativeAuthSessionProvider>
            <HomePage {...props} />
          </NativeAuthSessionProvider>
        ) : (
          <HomePage {...props} />
        )}
      </SnackbarProvider>
    </QueryClientProvider>,
  );
  return { ...result, client };
}
function renderDemo() {
  renderHome({ initialSession: 'team' });
  fireEvent.click(screen.getByRole('button', { name: '정기 세션 화면으로 전환' }));
}

afterEach(() => {
  onlineManager.setOnline(true);
  focusManager.setFocused(undefined);
  vi.unstubAllEnvs();
  mockPush.mockClear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('HomePage', () => {
  it('홈에 개발용 화면 목록 링크를 노출하지 않는다', () => {
    renderDemo();
    expect(screen.queryByRole('link', { name: '개발용 화면 목록' })).not.toBeInTheDocument();
  });

  it('이번 주 공지 3개가 각각의 공지 상세 페이지로 연결된다', async () => {
    renderDemo();
    expect(await screen.findByRole('link', { name: '6주차 세션 안내' })).toHaveAttribute(
      'href',
      '/notices/1',
    );
    expect(screen.getByRole('link', { name: '사용자 테스트 결과 제출' })).toHaveAttribute(
      'href',
      '/notices/2',
    );
    expect(screen.getByRole('link', { name: '운영진 전달 사항' })).toHaveAttribute(
      'href',
      '/notices/3',
    );
  });

  it('정기 세션과 팀 세션 모드를 토글할 수 있다', () => {
    renderDemo();
    const toggleButton = screen.getByRole('button', { name: '팀 세션 화면으로 전환' });
    expect(toggleButton).toBeInTheDocument();

    // 팀 세션 전환
    fireEvent.click(toggleButton);
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주는 팀 세션이에요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '인증 사진 올리기' })).toBeInTheDocument();
  });

  it('세션 정보, 주간 캘린더, 출석하기 버튼을 렌더링한다', () => {
    renderDemo();
    expect(screen.getByText('DMC 첨단산업센터')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주는 유저 플로우 리뷰 세션이에요' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('주간 일정')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '출석하기' })).toBeInTheDocument();
  });

  it('일정 및 출결 보고 바로가기 카드와 툴팁을 제공한다', () => {
    renderDemo();
    expect(screen.getByText('세션 시작 전에 미리 보고해 주세요')).toBeInTheDocument();
    const navigation = within(screen.getByRole('navigation', { name: '홈 바로가기' }));
    expect(navigation.getByRole('link', { name: '전체 세션 확인하기' })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(navigation.getByRole('button', { name: '출결 보고 미리하기' })).toBeInTheDocument();
  });

  it('출석하기 버튼 클릭 시 출석 코드 바텀시트가 열린다', () => {
    renderDemo();
    const attendanceBtn = screen.getByRole('button', { name: '출석하기' });
    fireEvent.click(attendanceBtn);

    expect(mockPush).toHaveBeenCalledWith('AttendanceCode', {});
  });

  it('출결 보고 버튼 클릭 시 출결 보고 바텀시트가 열린다', () => {
    renderDemo();
    const reportBtn = screen.getByRole('button', { name: '출결 보고 미리하기' });
    fireEvent.click(reportBtn);

    expect(mockPush).toHaveBeenCalledWith('AttendanceReport', {});
  });

  it('이번 주 공지 목록을 제공한다', async () => {
    renderDemo();
    const section = screen.getByRole('region', { name: '이번 주 공지' });
    expect(
      within(section).getByRole('heading', { level: 2, name: '이번 주 공지' }),
    ).toBeInTheDocument();
    expect(await within(section).findByText('6주차 세션 안내')).toBeInTheDocument();
    expect(within(section).getByText('사용자 테스트 결과 제출')).toBeInTheDocument();
    expect(within(section).getByText('운영진 전달 사항')).toBeInTheDocument();
  });
});

it('주간 API만 조회하고 서버 이름·한국 날짜·분과 세션 날짜를 표시한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T15:00:00Z'));
  const scheduleRequest = vi.fn<() => void>();
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () => {
      scheduleRequest();
      return HttpResponse.json({ sessions: [] });
    }),
  );
  renderHome();
  expect(await screen.findByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
  expect(screen.getByText('오후 1시 30분 시작')).toBeVisible();
  const date = screen.getByLabelText('2026-11-07 세션 예정');
  expect(date).toHaveAttribute('aria-current', 'date');
  expect(screen.getByLabelText('2026-11-01')).toHaveTextContent('1');
  expect(screen.getByRole('button', { name: '출석하기' })).toBeEnabled();
  expect(screen.queryByText('출석했어요!')).not.toBeInTheDocument();
  expect(scheduleRequest).not.toHaveBeenCalled();
});

it('세션 없는 주에도 응답의 달력을 표시한다', async () => {
  server.use(http.get(url, () => HttpResponse.json({ ...response, session: null })));
  renderHome();
  expect(await screen.findByText('이번 주 예정된 세션이 없어요')).toBeVisible();
  expect(screen.getByLabelText('2026-11-07')).toBeVisible();
  expect(screen.queryByRole('button', { name: '출석하기' })).not.toBeInTheDocument();
});

it('로딩과 오류를 카드에 한정하고 키보드 재시도로 복구한다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(
    http.get(url, async () => {
      await delay(60);
      return HttpResponse.json({}, { status: 500 });
    }),
  );
  renderHome();
  expect(screen.getByText('이번 주 세션을 불러오고 있어요…')).toBeVisible();
  expect(screen.getByRole('navigation', { name: '홈 바로가기' })).toBeVisible();
  expect(await screen.findByRole('alert')).toHaveTextContent('이번 주 세션을 불러오지 못했어요');
  server.use(http.get(url, () => HttpResponse.json(response)));
  await user.tab();
  expect(screen.getByRole('button', { name: '다시 시도' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
});

it('공지 조회 오류가 세션 카드를 막지 않고 재시도로 복구된다', async () => {
  const user = userEvent.setup();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(
    http.get(`${apiBaseUrl}/api/posts`, () =>
      HttpResponse.json({ code: 'NOTICE_UNAVAILABLE' }, { status: 500 }),
    ),
  );
  renderHome();

  expect(await screen.findByRole('heading', { name: '오늘은 설계 리뷰' })).toBeVisible();
  expect(await screen.findByRole('alert')).toHaveTextContent('이번 주 공지를 불러오지 못했어요');

  server.use(
    http.get(`${apiBaseUrl}/api/posts`, () =>
      HttpResponse.json({
        totalPostCount: memberNoticeFixture.length,
        items: memberNoticeFixture,
        nextCursor: null,
      }),
    ),
  );
  await user.click(screen.getByRole('button', { name: '다시 시도' }));

  expect(await screen.findByText('6주차 세션 안내')).toBeVisible();
  expect(screen.getByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
});

it('재조회 실패 시 기존 카드와 갱신 실패 안내를 유지한다', async () => {
  const { client } = renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  server.use(http.get(url, () => HttpResponse.json({}, { status: 500 })));
  await act(() => client.invalidateQueries({ queryKey: find3Options().queryKey }));
  expect(await screen.findByRole('alert')).toHaveTextContent('이전 내용을 표시하고 있어요');
  expect(screen.getByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
});

it('일반 브라우저는 모의 URL 상태로 API나 성공 흐름을 실행하지 않는다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  const request = vi.fn<() => void>();
  server.use(
    http.get(url, () => {
      request();
      return HttpResponse.json(response);
    }),
  );
  renderHome({ initialSession: 'team', initialAttendance: 'attended' });
  expect(await screen.findByText('세션은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.')).toBeVisible();
  expect(screen.getByRole('button', { name: '출결 보고 준비 중' })).toBeDisabled();
  expect(screen.queryByText('이번 주는 팀 세션이에요')).not.toBeInTheDocument();
  expect(screen.queryByText('세션 시작 전에 미리 보고해 주세요')).not.toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
});

it('로그인 WebView는 실제 출석 진입을 허용하고 보고는 준비 중이며 모의 완료를 표시하지 않는다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  let authorization: string | null = null;
  server.use(
    http.get(url, ({ request }) => {
      authorization = request.headers.get('Authorization');
      return HttpResponse.json(response);
    }),
  );
  renderHome({ initialSession: 'team', initialAttendance: 'attended' }, true);
  expect(await screen.findByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
  expect(authorization).toBe('Bearer test-token');
  expect(screen.getByRole('button', { name: '출석하기' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '출결 보고 준비 중' })).toBeDisabled();
  expect(
    within(screen.getByRole('button', { name: '출결 보고 준비 중' })).getByText('준비 중'),
  ).toBeVisible();
  expect(screen.queryByText('출결 보고 기능은 준비 중이에요.')).not.toBeInTheDocument();
  expect(screen.queryByText('출석했어요!')).not.toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
});

it('주 경계가 지나도 타이머로 조회하지 않고 화면 복귀 시 새 주를 조회한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-07T14:59:59.900Z'));
  let calls = 0;
  server.use(
    http.get(url, () => {
      calls += 1;
      return HttpResponse.json(
        calls === 1
          ? response
          : { weekStartDate: '2026-11-08', weekEndDate: '2026-11-14', session: null },
      );
    }),
  );
  renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  vi.setSystemTime(new Date('2026-11-07T15:00:00Z'));
  expect(calls).toBe(1);
  act(() => {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
  });
  await waitFor(() => expect(screen.getByText('이번 주 예정된 세션이 없어요')).toBeVisible());
  expect(calls).toBe(2);
  expect(screen.getByLabelText('2026-11-08')).toHaveAttribute('aria-current', 'date');
});

it('프로덕션에서는 목업 플래그가 있어도 시연 상태를 활성화하지 않는다', async () => {
  vi.stubEnv('DEV', false);
  renderHome({ initialSession: 'team', initialAttendance: 'attended' });
  expect(await screen.findByText('세션은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.')).toBeVisible();
  expect(screen.queryByRole('button', { name: '정기 세션 화면으로 전환' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '출결 보고 준비 중' })).toBeDisabled();
});

it('주 경계를 지난 캐시로 복귀하면 staleTime과 무관하게 새 주를 조회한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-07T15:00:01Z'));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData([...find3Options().queryKey], response, {
    updatedAt: Date.parse('2026-11-07T14:59:59Z'),
  });
  server.use(
    http.get(url, () =>
      HttpResponse.json({ weekStartDate: '2026-11-08', weekEndDate: '2026-11-14', session: null }),
    ),
  );
  render(
    <QueryClientProvider client={client}>
      <SnackbarProvider>
        <HomePage />
      </SnackbarProvider>
    </QueryClientProvider>,
  );
  expect(await screen.findByText('이번 주 예정된 세션이 없어요')).toBeVisible();
  expect(screen.getByLabelText('2026-11-08')).toHaveAttribute('aria-current', 'date');
});

it('주간 조회의 네트워크 오류 후 연결 복구 시 카드와 오류 안내를 함께 갱신한다', async () => {
  const { client } = renderHome();
  await screen.findByText(/설계 리뷰/);
  server.use(http.get(url, () => HttpResponse.error()));
  await act(() => client.invalidateQueries({ queryKey: find3Options().queryKey }));
  expect(await screen.findByRole('alert')).toBeVisible();
  expect(screen.getByText(/설계 리뷰/)).toBeVisible();

  act(() => onlineManager.setOnline(false));
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        session: { ...response.session, name: '복구된 주간 세션' },
      }),
    ),
  );
  act(() => onlineManager.setOnline(true));
  expect(await screen.findByText(/복구된 주간 세션/)).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each(['NOT_OPEN', 'NOT_ELIGIBLE'])(
  '서버 상태 %s에서는 출석을 시작할 수 없다',
  async (attendanceStatus) => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({ ...response, session: { ...response.session, attendanceStatus } }),
      ),
    );
    renderHome({}, true);
    await screen.findByRole('heading', { name: /설계 리뷰/ });
    expect(screen.queryByRole('button', { name: '출석하기' })).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  },
);

it('기본 목업은 정규 세션의 코드 출석으로 진입하고 팀 사진 진입점을 숨긴다', async () => {
  server.use(http.get(url, () => HttpResponse.json(currentWeekFixture)));
  const user = userEvent.setup();
  renderHome();
  await user.click(await screen.findByRole('button', { name: '출석하기' }));
  expect(mockPush).toHaveBeenCalledWith('AttendanceCode', {});
  expect(screen.queryByRole('button', { name: '인증 사진 올리기' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '팀 세션 화면으로 전환' })).not.toBeInTheDocument();
});
