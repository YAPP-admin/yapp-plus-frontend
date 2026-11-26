import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from '@yapp-plus/ui';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { find1QueryKey, find6Options } from '@yapp-plus/api/generated';
import { http, HttpResponse, delay } from 'msw';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { memberNoticeListQueryOptions } from '@/features/member-notice';
import { apiBaseUrl, server } from '../../../mocks/server';
import { memberNoticeFixture } from '../../../mocks/member-notice-handlers';
import { currentWeekFixture } from '../../../mocks/session-handlers';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './home-page';
import { calendarDateBadgeActive } from './home-page.css';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';

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
const teamPhotoUrl = `${apiBaseUrl}/api/sessions/42/team-attendance-photos`;
const response = {
  ...currentWeekFixture,
  session: {
    ...currentWeekFixture.session,
    sessionId: 42,
    name: '설계 리뷰',
    location: null,
    attendanceStatus: 'AVAILABLE',
  },
};
const teamResponse = {
  ...response,
  session: {
    ...response.session,
    type: 'TEAM' as const,
    location: null,
    roadAddress: null,
    latitude: null,
    longitude: null,
    detailAddress: null,
  },
};
const pendingTeamResponse = {
  ...teamResponse,
  session: { ...teamResponse.session, attendanceStatus: 'PENDING_APPROVAL' },
};
const submittedPhoto = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => ({
  photo: {
    photoId: 1,
    teamId: 1,
    teamName: 'YAPP+',
    status,
    imageUrl: 'https://image.yapp.test/team-attendance.jpg',
    imageUrlExpiresAt: null,
    uploadedAt: '2026-11-07T05:00:00Z',
    uploadedTime: '14:00',
    submittedAt: '2026-11-07T05:00:00Z',
    uploader: { userId: 1, name: '김야뿌' },
    selectedMemberCount: 3,
  },
});
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
  const renderTree = (active = true) => (
    <QueryClientProvider client={client}>
      <SnackbarProvider>
        {native ? (
          <NativeAuthSessionProvider>
            <ScreenActiveContext value={active}>
              <HomePage {...props} />
            </ScreenActiveContext>
          </NativeAuthSessionProvider>
        ) : (
          <ScreenActiveContext value={active}>
            <HomePage {...props} />
          </ScreenActiveContext>
        )}
      </SnackbarProvider>
    </QueryClientProvider>
  );
  const result = render(renderTree());
  return { ...result, client, renderTree };
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

  it('일정 및 출결 보고 바로가기 카드를 제공하고 일반 브라우저 보고를 막는다', () => {
    renderDemo();
    const navigation = within(screen.getByRole('navigation', { name: '홈 바로가기' }));
    expect(navigation.getByRole('link', { name: '전체 세션 확인하기' })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(navigation.getByRole('button', { name: '출결 보고 준비 중' })).toBeDisabled();
    expect(screen.queryByText('세션 시작 전에 미리 보고해 주세요')).not.toBeInTheDocument();
  });

  it('출석하기 버튼 클릭 시 출석 코드 바텀시트가 열린다', () => {
    renderDemo();
    const attendanceBtn = screen.getByRole('button', { name: '출석하기' });
    fireEvent.click(attendanceBtn);

    expect(mockPush).toHaveBeenCalledWith('AttendanceCode', {});
  });

  it('일반 브라우저의 출결 보고 버튼은 목업 설정과 무관하게 이동하지 않는다', () => {
    renderDemo();
    const reportBtn = screen.getByRole('button', { name: '출결 보고 준비 중' });
    fireEvent.click(reportBtn);

    expect(mockPush).not.toHaveBeenCalled();
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
  expect(
    await screen.findByRole('heading', { level: 2, name: '이번 주는 설계 리뷰 세션이에요' }),
  ).toBeVisible();
  expect(screen.getByText('오후 1시 30분 시작')).toBeVisible();
  const date = screen.getByLabelText('2026-11-07 세션 예정');
  expect(date).toHaveAttribute('aria-current', 'date');
  expect(date).toHaveClass(calendarDateBadgeActive);
  expect(
    screen.getByLabelText('주간 일정').getElementsByClassName(calendarDateBadgeActive),
  ).toHaveLength(1);
  expect(screen.getByLabelText('2026-11-01')).toHaveTextContent('1');
  expect(screen.getByRole('button', { name: '출석하기' })).toBeEnabled();
  expect(screen.queryByText('출석했어요!')).not.toBeInTheDocument();
  expect(scheduleRequest).not.toHaveBeenCalled();
});

it.each(['REGULAR', 'TEAM'])(
  '%s 출석 완료일은 오늘의 원 대신 배지와 출석 문구를 표시한다',
  async (type) => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({
          ...response,
          session: { ...response.session, type, attendanceStatus: 'CHECKED_IN' },
        }),
      ),
    );
    renderHome();

    const date = await screen.findByLabelText('2026-11-07 출석 완료');
    expect(date).toHaveAttribute('dateTime', '2026-11-07');
    expect(date).toHaveAttribute('aria-current', 'date');
    expect(date).toHaveTextContent('7');
    expect(date).not.toHaveClass(calendarDateBadgeActive);
    expect(within(date).getByText('2026-11-07 출석 완료')).toBeInTheDocument();
    expect(within(date).getByAltText('')).toHaveAttribute(
      'src',
      '/images/home/calendar-attendance-complete.svg',
    );
    expect(within(screen.getByLabelText('주간 일정')).getByText('출석')).toBeVisible();
    expect(screen.queryByLabelText('2026-11-07 세션 예정')).not.toBeInTheDocument();
  },
);

it('같은 주의 지난 출석 완료일을 유지하고 오늘은 별도의 원으로 강조한다', async () => {
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        session: { ...response.session, date: '2026-11-04', attendanceStatus: 'CHECKED_IN' },
      }),
    ),
  );
  renderHome();

  const completedDate = await screen.findByLabelText('2026-11-04 출석 완료');
  expect(completedDate).toHaveTextContent('4');
  expect(within(completedDate).getByAltText('')).toBeInTheDocument();
  expect(completedDate).not.toHaveAttribute('aria-current');
  const today = screen.getByLabelText('2026-11-07');
  expect(today).toHaveAttribute('aria-current', 'date');
  expect(today).toHaveClass(calendarDateBadgeActive);
});

it('완료 배지 안에 두 자리의 실제 세션 날짜를 표시한다', async () => {
  vi.setSystemTime(new Date('2026-11-14T03:00:00Z'));
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        weekStartDate: '2026-11-08',
        weekEndDate: '2026-11-14',
        session: { ...response.session, date: '2026-11-14', attendanceStatus: 'CHECKED_IN' },
      }),
    ),
  );
  renderHome();

  const date = await screen.findByLabelText('2026-11-14 출석 완료');
  expect(date).toHaveTextContent('14');
  expect(within(date).getByAltText('')).toBeInTheDocument();
});

it.each(['AVAILABLE', 'NOT_OPEN', 'NOT_ELIGIBLE', 'PENDING_APPROVAL'])(
  '%s 상태는 완료 배지와 출석 문구를 표시하지 않는다',
  async (attendanceStatus) => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({
          ...teamResponse,
          session: { ...teamResponse.session, attendanceStatus },
        }),
      ),
      http.get(teamPhotoUrl, () => HttpResponse.json({ photo: null })),
    );
    renderHome();

    const date = await screen.findByLabelText('2026-11-07 세션 예정');
    if (attendanceStatus === 'PENDING_APPROVAL') {
      await screen.findByRole('button', { name: '인증 사진 검토 중' });
    }
    expect(date).toHaveClass(calendarDateBadgeActive);
    expect(within(date).queryByAltText('')).not.toBeInTheDocument();
    expect(within(screen.getByLabelText('주간 일정')).queryByText('출석')).not.toBeInTheDocument();
  },
);

it('오늘과 세션 예정일이 다르면 한국 시간의 오늘만 원형으로 강조한다', async () => {
  vi.setSystemTime(new Date('2026-11-05T15:00:00Z'));
  renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  const today = screen.getByLabelText('2026-11-06');
  expect(today).toHaveAttribute('aria-current', 'date');
  expect(today).toHaveClass(calendarDateBadgeActive);
  const sessionDate = screen.getByLabelText('2026-11-07 세션 예정');
  expect(sessionDate).not.toHaveAttribute('aria-current');
  expect(sessionDate).not.toHaveClass(calendarDateBadgeActive);
  expect(
    screen.getByLabelText('주간 일정').getElementsByClassName(calendarDateBadgeActive),
  ).toHaveLength(1);
});

it('오늘이 응답의 주간 범위 밖이면 어느 날짜도 원형으로 강조하지 않는다', async () => {
  vi.setSystemTime(new Date('2026-11-08T15:00:00Z'));
  renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  const calendar = screen.getByLabelText('주간 일정');
  expect(calendar.getElementsByClassName(calendarDateBadgeActive)).toHaveLength(0);
  expect(calendar.querySelector('[aria-current="date"]')).not.toBeInTheDocument();
});

it('세션 없는 주에도 응답의 달력을 표시한다', async () => {
  server.use(http.get(url, () => HttpResponse.json({ ...response, session: null })));
  renderHome();
  expect(await screen.findByText('이번 주 예정된 세션이 없어요')).toBeVisible();
  expect(screen.getByLabelText('2026-11-07')).toBeVisible();
  expect(screen.getByLabelText('2026-11-07')).toHaveClass(calendarDateBadgeActive);
  expect(
    screen.getByLabelText('주간 일정').getElementsByClassName(calendarDateBadgeActive),
  ).toHaveLength(1);
  expect(screen.queryByRole('button', { name: '출석하기' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/출석 완료$/)).not.toBeInTheDocument();
  expect(within(screen.getByLabelText('주간 일정')).queryByText('출석')).not.toBeInTheDocument();
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

  expect(
    await screen.findByRole('heading', { name: '이번 주는 설계 리뷰 세션이에요' }),
  ).toBeVisible();
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

it('주간 공지 재조회 실패는 공지 영역만 오류 안내로 교체한다', async () => {
  const { client } = renderHome();
  expect(await screen.findByText('6주차 세션 안내')).toBeVisible();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(
    http.get(`${apiBaseUrl}/api/posts`, () =>
      HttpResponse.json({ code: 'NOTICE_UNAVAILABLE' }, { status: 500 }),
    ),
  );
  await act(() =>
    client.invalidateQueries({ queryKey: memberNoticeListQueryOptions('ALL').queryKey }),
  );

  expect(await screen.findByRole('alert')).toHaveTextContent('이번 주 공지를 불러오지 못했어요');
  expect(screen.queryByText('6주차 세션 안내')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
});

it('주간 세션 재조회 실패는 카드만 오류 안내로 교체한다', async () => {
  const { client } = renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(http.get(url, () => HttpResponse.json({}, { status: 500 })));
  await act(() => client.invalidateQueries({ queryKey: find6Options().queryKey }));
  expect(await screen.findByRole('alert')).toHaveTextContent('이번 주 세션을 불러오지 못했어요');
  expect(screen.queryByRole('button', { name: '출석하기' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /설계 리뷰/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '전체 세션 확인하기' })).toBeVisible();
  server.use(http.get(url, () => HttpResponse.json(response)));
  await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('heading', { name: /설계 리뷰/ })).toBeVisible();
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

it('로그인 WebView는 실제 출석과 출결 보고 진입을 허용한다', async () => {
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
  await userEvent.click(screen.getByRole('button', { name: '출결 보고하기' }));
  expect(mockPush).toHaveBeenCalledWith('AttendanceReport', {});
  expect(screen.queryByText('출석했어요!')).not.toBeInTheDocument();
});

it('기간 내 출결 보고 안내는 홈이 비활성화되면 제거되고 복귀하면 다시 표시한다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  const view = renderHome({}, true);

  expect(await screen.findByText('세션 시작 전에 미리 보고해 주세요')).toBeVisible();
  fireEvent.pointerDown(document.body);
  expect(screen.getByText('세션 시작 전에 미리 보고해 주세요')).toBeVisible();

  view.rerender(view.renderTree(false));
  expect(screen.queryByText('세션 시작 전에 미리 보고해 주세요')).not.toBeInTheDocument();

  view.rerender(view.renderTree(true));
  expect(await screen.findByText('세션 시작 전에 미리 보고해 주세요')).toBeVisible();
});

it.each(['화면 복귀', '앱 복귀'])(
  'fresh 주간 캐시도 %s 시 서버 정정을 반영한다',
  async (trigger) => {
    let calls = 0;
    server.use(
      http.get(url, () => {
        calls += 1;
        return HttpResponse.json({
          ...response,
          session: {
            ...response.session,
            attendanceStatus: calls === 1 ? 'CHECKED_IN' : 'AVAILABLE',
          },
        });
      }),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    const tree = (active: boolean) => (
      <QueryClientProvider client={client}>
        <SnackbarProvider>
          <ScreenActiveContext value={active}>
            <HomePage />
          </ScreenActiveContext>
        </SnackbarProvider>
      </QueryClientProvider>
    );
    const view = render(tree(true));
    expect(await screen.findByRole('button', { name: '출석했어요!' })).toBeDisabled();
    expect(screen.getByLabelText('2026-11-07 출석 완료')).toBeVisible();
    expect(within(screen.getByLabelText('주간 일정')).getByText('출석')).toBeVisible();
    if (trigger === '화면 복귀') {
      view.rerender(tree(false));
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      view.rerender(tree(true));
    } else {
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
    }
    expect(await screen.findByRole('button', { name: '출석하기' })).toBeEnabled();
    expect(screen.queryByLabelText('2026-11-07 출석 완료')).not.toBeInTheDocument();
    expect(screen.getByLabelText('2026-11-07 세션 예정')).toHaveClass(calendarDateBadgeActive);
    expect(within(screen.getByLabelText('주간 일정')).queryByText('출석')).not.toBeInTheDocument();
    expect(calls).toBe(2);
  },
);

it('주 경계가 지나도 타이머로 조회하지 않고 화면 복귀 시 새 주를 조회한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-07T14:59:59.900Z'));
  let calls = 0;
  server.use(
    http.get(url, () => {
      calls += 1;
      return HttpResponse.json(
        calls === 1
          ? { ...response, session: { ...response.session, attendanceStatus: 'CHECKED_IN' } }
          : { weekStartDate: '2026-11-08', weekEndDate: '2026-11-14', session: null },
      );
    }),
  );
  renderHome();
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  expect(screen.getByLabelText('2026-11-07 출석 완료')).toBeVisible();
  vi.setSystemTime(new Date('2026-11-07T15:00:00Z'));
  expect(calls).toBe(1);
  act(() => {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
  });
  await waitFor(() => expect(screen.getByText('이번 주 예정된 세션이 없어요')).toBeVisible());
  expect(calls).toBe(2);
  expect(screen.queryByLabelText(/출석 완료$/)).not.toBeInTheDocument();
  expect(within(screen.getByLabelText('주간 일정')).queryByText('출석')).not.toBeInTheDocument();
  expect(screen.getByLabelText('2026-11-08')).toHaveAttribute('aria-current', 'date');
  expect(screen.getByLabelText('2026-11-08')).toHaveClass(calendarDateBadgeActive);
  expect(
    screen.getByLabelText('주간 일정').getElementsByClassName(calendarDateBadgeActive),
  ).toHaveLength(1);
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
  client.setQueryData([...find6Options().queryKey], response, {
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

it('주간 재조회 실패 뒤 수동 재시도로 카드를 복구한다', async () => {
  const user = userEvent.setup();
  const { client } = renderHome();
  await screen.findByText(/설계 리뷰/);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(http.get(url, () => HttpResponse.error()));
  await act(() => client.invalidateQueries({ queryKey: find6Options().queryKey }));
  expect(await screen.findByRole('alert')).toHaveTextContent('이번 주 세션을 불러오지 못했어요');
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        session: { ...response.session, name: '복구된 주간 세션' },
      }),
    ),
  );
  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText(/복구된 주간 세션/)).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each([
  ['REGULAR', '2026-01-02T14:59:59Z', '00:00', '3일 00:00에 세션이 시작돼요'],
  ['REGULAR', '2026-01-02T15:00:00Z', '13:30:45', '13:10에 출석할 수 있어요'],
  ['TEAM', '2026-01-02T14:59:59Z', '00:00:00', '3일 00:00에 세션이 시작돼요'],
  ['TEAM', '2026-01-02T15:00:00Z', '09:05', '09:05에 출석할 수 있어요'],
  ['TEAM', '2026-01-02T15:00:00Z', '00:10', '00:10에 출석할 수 있어요'],
  ['REGULAR', '2026-01-02T15:00:00Z', '00:10', '2일 23:50에 출석할 수 있어요'],
  ['REGULAR', '2026-01-03T09:00:00Z', '14:00', '출석이 마감됐어요'],
  ['TEAM', '2026-01-03T09:00:00Z', '14:00', '출석이 마감됐어요'],
])('%s 출석 전에는 한국 날짜(%s)에 맞는 안내를 표시한다', async (type, now, startTime, label) => {
  vi.setSystemTime(new Date(now));
  const photoRequest = vi.fn<() => void>();
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...response,
        weekStartDate: '2025-12-28',
        weekEndDate: '2026-01-03',
        session: {
          ...teamResponse.session,
          type,
          date: '2026-01-03',
          startTime,
          endTime: '18:00:00',
          attendanceStatus: 'NOT_OPEN',
        },
      }),
    ),
    http.get(teamPhotoUrl, () => {
      photoRequest();
      return HttpResponse.json(submittedPhoto('PENDING'));
    }),
  );
  const user = userEvent.setup();
  renderHome({}, true);

  const button = await screen.findByRole('button', {
    name: label,
  });
  expect(button).toBeDisabled();
  expect(screen.queryByText(/시작$/)).not.toBeInTheDocument();
  await user.click(button);
  expect(mockPush).not.toHaveBeenCalled();
  expect(photoRequest).not.toHaveBeenCalled();
});

it.each(['NOT_ELIGIBLE'])('서버 상태 %s에서는 출석을 시작할 수 없다', async (attendanceStatus) => {
  server.use(
    http.get(url, () =>
      HttpResponse.json({ ...response, session: { ...response.session, attendanceStatus } }),
    ),
  );
  renderHome({}, true);
  await screen.findByRole('heading', { name: /설계 리뷰/ });
  expect(screen.queryByRole('button', { name: '출석하기' })).not.toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
});

it('기본 목업은 정규 세션의 코드 출석으로 진입하고 팀 사진 진입점을 숨긴다', async () => {
  server.use(http.get(url, () => HttpResponse.json(currentWeekFixture)));
  const user = userEvent.setup();
  renderHome();
  await user.click(await screen.findByRole('button', { name: '출석하기' }));
  expect(mockPush).toHaveBeenCalledWith('AttendanceCode', {});
  expect(screen.queryByRole('button', { name: '인증 사진 올리기' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '팀 세션 화면으로 전환' })).not.toBeInTheDocument();
});

it('AVAILABLE 팀 세션은 사진 조회 없이 팀 사진 안내로 이동한다', async () => {
  const photoRequest = vi.fn<() => void>();
  server.use(
    http.get(url, () => HttpResponse.json(teamResponse)),
    http.get(teamPhotoUrl, () => {
      photoRequest();
      return HttpResponse.json(submittedPhoto('PENDING'));
    }),
  );
  const user = userEvent.setup();
  renderHome({}, true);

  await user.click(await screen.findByRole('button', { name: '인증 사진 올리기' }));

  expect(mockPush).toHaveBeenCalledWith('TeamAttendanceGuide', { sessionId: '42' });
  expect(photoRequest).not.toHaveBeenCalled();
});

it.each([
  ['CHECKED_IN', '출석했어요!'],
  ['NOT_ELIGIBLE', '출석 대상이 아니에요'],
])('TEAM %s는 사진 조회 없이 출석 상태를 표시한다', async (attendanceStatus, label) => {
  const photoRequest = vi.fn<() => void>();
  server.use(
    http.get(url, () =>
      HttpResponse.json({
        ...teamResponse,
        session: { ...teamResponse.session, attendanceStatus },
      }),
    ),
    http.get(teamPhotoUrl, () => {
      photoRequest();
      return HttpResponse.json(submittedPhoto('PENDING'));
    }),
  );
  renderHome({}, true);

  expect(await screen.findByRole('button', { name: label })).toBeDisabled();
  expect(photoRequest).not.toHaveBeenCalled();
});

it('TEAM 사진을 불러오는 동안 주간 세션 카드와 사진 영역의 로딩 상태를 함께 표시한다', async () => {
  let releasePhoto!: () => void;
  const photoRequest = new Promise<void>((resolve) => {
    releasePhoto = resolve;
  });
  server.use(
    http.get(url, () => HttpResponse.json(pendingTeamResponse)),
    http.get(teamPhotoUrl, async () => {
      await photoRequest;
      return HttpResponse.json({ photo: null });
    }),
  );
  renderHome({}, true);

  expect(
    await screen.findByRole('heading', { name: '이번 주는 설계 리뷰 세션이에요' }),
  ).toBeVisible();
  expect(screen.getByText('인증 사진을 확인하고 있어요…')).toBeInTheDocument();

  act(() => {
    releasePhoto();
  });
  expect(await screen.findByRole('button', { name: '인증 사진 검토 중' })).toBeDisabled();
});

it.each([
  ['PENDING', '운영진이 확인하고 있어요'],
  ['APPROVED', '팀 인증이 완료됐어요'],
  ['REJECTED', '팀 인증 사진이 반려됐어요'],
] as const)('TEAM 세션의 %s 사진은 제출 상태 행으로 표시한다', async (status, title) => {
  server.use(
    http.get(url, () => HttpResponse.json(pendingTeamResponse)),
    http.get(teamPhotoUrl, () => HttpResponse.json(submittedPhoto(status))),
  );
  renderHome({}, true);

  expect(await screen.findByRole('status')).toHaveTextContent(
    `${title}14:00 김야뿌 업로드 (참석 3명)`,
  );
  expect(screen.queryByRole('button', { name: '인증 사진 올리기' })).not.toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
});

it.each([
  ['HTTP 오류', () => HttpResponse.json({}, { status: 500 })],
  ['네트워크 오류', () => HttpResponse.error()],
])('TEAM 사진 조회 %s는 사진 상태 오류 안내로 바꾼다', async (_, errorResponse) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(
    http.get(url, () => HttpResponse.json(pendingTeamResponse)),
    http.get(teamPhotoUrl, errorResponse),
  );
  renderHome({}, true);

  expect(await screen.findByRole('alert')).toHaveTextContent('인증 사진 상태를 불러오지 못했어요');
  expect(screen.queryByRole('button', { name: '인증 사진 올리기' })).not.toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
});

it('TEAM 사진 재조회 실패는 사진 상태 오류 안내로 교체한다', async () => {
  server.use(
    http.get(url, () => HttpResponse.json(pendingTeamResponse)),
    http.get(teamPhotoUrl, () => HttpResponse.json(submittedPhoto('PENDING'))),
  );
  const { client } = renderHome({}, true);
  expect(await screen.findByRole('status')).toHaveTextContent('운영진이 확인하고 있어요');

  vi.spyOn(console, 'error').mockImplementation(() => {});
  server.use(http.get(teamPhotoUrl, () => HttpResponse.error()));
  await act(async () => {
    await client.invalidateQueries({ queryKey: find1QueryKey({ path: { sessionId: 42 } }) });
  });

  expect(await screen.findByRole('alert')).toHaveTextContent('인증 사진 상태를 불러오지 못했어요');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '인증 사진 올리기' })).not.toBeInTheDocument();
});
