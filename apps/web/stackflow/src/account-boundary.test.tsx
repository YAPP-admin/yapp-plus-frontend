import { apiBaseUrl, server } from '@/mocks/server';
import { createAppQueryClient } from '@/app/providers';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { getAppBridge } from '@yapp-plus/app-bridge/web';
import type { pickAttendancePhoto } from '@yapp-plus/app-bridge/web';
import type * as AppBridgeWeb from '@yapp-plus/app-bridge/web';
import { MutationObserver, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense, useEffect } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AuthResult, LocationResult } from '@yapp-plus/app-bridge';
import { http, HttpResponse } from 'msw';
import {
  NativeAuthSessionProvider,
  nativeSignInMutationOptions,
  nativeSignOutMutationOptions,
  nativeSignupMutationOptions,
  nativeWithdrawMutationOptions,
} from '@/features/auth';
import { createStackflowApp } from './stack';
import {
  TeamAttendancePhotoDraftProvider,
  useTeamAttendancePhotoDraft,
} from '@/pages/team-attendance-upload';

const bridge = vi.hoisted(() => ({
  result: { status: 'SIGNED_OUT' } as AuthResult,
  getSession: vi.fn<() => Promise<unknown>>(),
  refreshSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
const replacedActivities = vi.hoisted(() => vi.fn<(name: string) => void>());
vi.mock(import('./account-boundary'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    accountBoundaryPlugin: () => {
      const plugin = original.accountBoundaryPlugin();
      return () => {
        const hooks = plugin();
        return {
          ...hooks,
          onReplaced: (args: Parameters<NonNullable<typeof hooks.onReplaced>>[0]) => {
            hooks.onReplaced?.(args);
            replacedActivities(args.effect.activity.name);
          },
        };
      };
    },
  };
});
const nativeLocation = vi.hoisted(() => ({
  request: vi.fn<() => Promise<LocationResult>>(),
}));
const replaceDocument = vi.fn<(url: string | URL) => void>();
const historyListeners: EventListenerOrEventListenerObject[] = [];
const stackflowIntervals = new Set<ReturnType<typeof globalThis.setInterval>>();
const addListener = window.addEventListener.bind(window);
const addInterval = globalThis.setInterval.bind(globalThis);
beforeEach(() => {
  replacedActivities.mockClear();
  window.history.replaceState(null, '', '/');
  bridge.result = { status: 'SIGNED_OUT' };
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  // 팀 사진 폼은 개발 모의 환경에서만 노출한다. 인증 경계 검증도 같은 조건으로 실행한다.
  vi.stubEnv('VITE_API_MOCKING', 'true');
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'popstate' && listener) {
      historyListeners.push(listener);
    }
    addListener(type, listener, options);
  });
  vi.spyOn(globalThis, 'setInterval').mockImplementation((handler, timeout, ...args) => {
    const interval = addInterval(handler, timeout, ...args);
    stackflowIntervals.add(interval);
    return interval;
  });
  replaceDocument.mockClear();
  vi.spyOn(window.location, 'replace').mockImplementation(replaceDocument);
  server.use(
    http.get(`${apiBaseUrl}/api/sessions/:sessionId/team-members`, () =>
      HttpResponse.json({
        teamId: 1,
        teamName: 'Web 팀',
        members: [
          { membershipId: 1, name: '강야뿌', position: 'WEB', isMe: false },
          { membershipId: 2, name: '김야뿌', position: null, isMe: true },
        ],
      }),
    ),
  );
});
afterEach(async () => {
  // Stackflow core는 전환 안정화 interval의 dispose API를 제공하지 않습니다.
  // 테스트 DOM이 해제되기 전에 이 파일에서 시작한 interval을 직접 정리합니다.
  for (const interval of stackflowIntervals) {
    clearInterval(interval);
  }
  stackflowIntervals.clear();
  if (
    'happyDOM' in window &&
    window.happyDOM instanceof Object &&
    'abort' in window.happyDOM &&
    typeof window.happyDOM.abort === 'function'
  ) {
    await window.happyDOM.abort();
  }
  for (const listener of historyListeners.splice(0)) {
    window.removeEventListener('popstate', listener);
  }
  document.documentElement.hidden = false;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  bridge.getSession.mockReset();
  bridge.refreshSession.mockReset();
  nativeLocation.request.mockReset();
  vi.useRealTimers();
});
const context = { platform: 'ios' as const, reducedMotion: true };
const session = (userId: number, tokenVersion = 1, name?: string): AuthResult => ({
  status: 'SIGNED_IN',
  reviewTransition: 'NONE',
  session: {
    userId,
    sessionId: `session-${userId}`,
    tokenVersion,
    name,
    accessToken: 'test',
    expiresAt: 999999,
  },
});
const apply = (
  client: QueryClient,
  result: AuthResult,
  kind: 'authenticate' | 'signup' | 'logout' | 'withdraw' = 'authenticate',
) => {
  bridge.result = result;
  if (kind === 'withdraw') {
    return new MutationObserver(client, nativeWithdrawMutationOptions(client)).mutate({
      input: undefined,
    });
  }
  if (kind === 'logout') {
    return new MutationObserver(client, nativeSignOutMutationOptions(client)).mutate({
      input: undefined,
    });
  }
  if (kind === 'signup') {
    return new MutationObserver(client, nativeSignupMutationOptions(client)).mutate({
      input: { name: '테스트', phoneNumber: '01012345678' },
    });
  }
  return new MutationObserver(client, nativeSignInMutationOptions(client)).mutate({
    input: 'google',
  });
};
const mount = (client: QueryClient, initialContext = context) => {
  const { Stack, actions } = createStackflowApp({ reducedMotion: true, queryClient: client });
  const view = render(
    <QueryClientProvider client={client}>
      <Suspense fallback="로딩 중">
        <NativeAuthSessionProvider>
          <TeamAttendancePhotoDraftProvider>
            <TeamAttendancePhotoFixture />
            <Stack initialContext={initialContext} />
          </TeamAttendancePhotoDraftProvider>
        </NativeAuthSessionProvider>
      </Suspense>
    </QueryClientProvider>,
  );
  return { ...view, actions };
};

function TeamAttendancePhotoFixture() {
  const { setPhoto } = useTeamAttendancePhotoDraft();
  useEffect(() => {
    setPhoto(new File(['abc'], 'team-attendance.jpg', { type: 'image/jpeg' }));
  }, [setPhoto]);
  return null;
}

it('구 앱의 전환 필드 없는 세션은 수신 정규화 후 로그인 URL에서 홈으로 이동한다', async () => {
  window.history.replaceState(null, '', '/login');
  const approved = session(1);
  if (approved.status !== 'SIGNED_IN') {
    throw new Error('승인된 세션 fixture가 필요합니다.');
  }
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_IN', session: approved.session });
  mount(new QueryClient());
  await screen.findByRole('tab', { name: '일정' }, { timeout: 10000 });
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  expect(screen.queryByRole('button', { name: '구글로 계속하기' })).not.toBeInTheDocument();
  expect(bridge.getSession).toHaveBeenCalledTimes(1);
  expect(replacedActivities.mock.calls).toEqual([['Tabs']]);
}, 15000);

it('대기 상태 없이 승인 대기 URL에 직접 진입하면 로그인으로 복귀한다', async () => {
  window.history.replaceState(null, '', '/signup/status');
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  mount(new QueryClient());
  expect(screen.queryByText('운영진 승인을 기다리고 있어요...')).not.toBeInTheDocument();
  await screen.findByRole('button', { name: '구글로 계속하기' }, { timeout: 10000 });
  await waitFor(() => expect(window.location.pathname).toBe('/login'));
  expect(screen.queryByText('운영진 승인을 기다리고 있어요...')).not.toBeInTheDocument();
}, 15000);

it.each(['PENDING', 'REJECTED', null] as const)(
  '제한 상태 %s의 보호 URL 진입은 업무 화면 없이 상태 화면으로 이동한다',
  async (reviewStatus) => {
    window.history.replaceState(null, '', '/schedule');
    bridge.getSession.mockResolvedValue({ status: 'REVIEW_REQUIRED', userId: 1, reviewStatus });
    const client = new QueryClient();
    mount(client);
    const title =
      reviewStatus === 'PENDING' ? '운영진 승인을 기다리고 있어요...' : '앗, 문제가 발생했어요!';
    await screen.findByRole('heading', { name: title }, { timeout: 10000 });
    await waitFor(() =>
      expect(window.location.pathname).toBe(
        reviewStatus === 'PENDING' ? '/signup/status' : '/error',
      ),
    );
    expect(screen.queryByRole('tab', { name: '일정' })).not.toBeInTheDocument();
    expect(
      client
        .getQueryCache()
        .getAll()
        .filter((query) => query.queryKey[0] !== 'native-auth'),
    ).toHaveLength(0);
  },
  15000,
);

it.each(['PENDING', 'REJECTED', null] as const)(
  '로그인의 %s 응답은 상태 화면으로 한 번만 이동한다',
  async (reviewStatus) => {
    window.history.replaceState(null, '', '/login');
    bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });
    mount(new QueryClient());
    const login = await screen.findByRole(
      'button',
      { name: '구글로 계속하기' },
      { timeout: 10000 },
    );
    bridge.result = { status: 'REVIEW_REQUIRED', userId: 1, reviewStatus };
    bridge.getSession.mockResolvedValue(bridge.result);
    await userEvent.click(login);
    await screen.findByRole('heading', {
      name:
        reviewStatus === 'PENDING' ? '운영진 승인을 기다리고 있어요...' : '앗, 문제가 발생했어요!',
    });
    await waitFor(() =>
      expect(replacedActivities.mock.calls).toEqual([
        [reviewStatus === 'PENDING' ? 'SignupStatus' : 'Error'],
      ]),
    );
    expect(screen.queryByRole('tab', { name: '일정' })).not.toBeInTheDocument();
  },
  15000,
);

it('가입의 PENDING 응답도 인증 상태 반영 후 대기 화면으로 한 번만 이동한다', async () => {
  const user = userEvent.setup();
  window.history.replaceState(null, '', '/signup');
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  mount(new QueryClient());
  await user.type(
    await screen.findByRole('textbox', { name: '이름을 입력해 주세요' }, { timeout: 10000 }),
    '김야뿌',
  );
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.type(
    await screen.findByRole('textbox', { name: '휴대폰 번호를 입력해 주세요' }),
    '01012345678',
  );
  bridge.result = { status: 'REVIEW_REQUIRED', userId: 1, reviewStatus: 'PENDING' };
  bridge.getSession.mockResolvedValue(bridge.result);
  await user.click(screen.getByRole('button', { name: '다음' }));
  await screen.findByRole('heading', { name: '운영진 승인을 기다리고 있어요...' });
  await waitFor(() => expect(replacedActivities.mock.calls).toEqual([['SignupStatus']]));
  expect(window.location.pathname).toBe('/signup/status');
}, 15000);

it.each([
  { userId: 1, reviewTransition: 'PENDING_TO_APPROVED', destination: '/signup/complete' },
  { userId: 2, reviewTransition: 'NONE', destination: '/' },
] as const)(
  '대기 복귀 후 계정 $userId 승인 로그인은 $destination 으로 이동한다',
  async ({ userId, reviewTransition, destination }) => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/signup/status');
    bridge.getSession.mockResolvedValue({
      status: 'REVIEW_REQUIRED',
      userId: 1,
      reviewStatus: 'PENDING',
    });
    mount(new QueryClient());
    await screen.findByRole(
      'heading',
      { name: '운영진 승인을 기다리고 있어요...' },
      { timeout: 10000 },
    );
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    await user.click(await screen.findByRole('button', { name: '취소' }));
    expect(window.location.pathname).toBe('/signup/status');
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    bridge.result = { status: 'SIGNED_OUT' };
    await user.click(await screen.findByRole('button', { name: '로그인으로 돌아가기' }));
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
    const approved = session(userId);
    if (approved.status !== 'SIGNED_IN') {
      throw new Error('승인된 세션 fixture가 필요합니다.');
    }
    bridge.result = { ...approved, reviewTransition };
    replacedActivities.mockClear();
    await user.click(await screen.findByRole('button', { name: '구글로 계속하기' }));
    await waitFor(() => expect(window.location.pathname).toBe(destination));
    await waitFor(() =>
      expect(screen.queryByRole('tab', { name: '일정' }) !== null).toBe(
        reviewTransition === 'NONE',
      ),
    );
    expect(replacedActivities.mock.calls).toEqual([
      [reviewTransition === 'NONE' ? 'Tabs' : 'SignupComplete'],
    ]);
  },
  15000,
);

it('대기 복귀 정리가 실패하면 대기를 유지하고 재시도 성공 후 로그인으로 돌아간다', async () => {
  const user = userEvent.setup();
  window.history.replaceState(null, '', '/signup/status');
  bridge.getSession.mockResolvedValue({
    status: 'REVIEW_REQUIRED',
    userId: 1,
    reviewStatus: 'PENDING',
  });
  mount(new QueryClient());
  await screen.findByRole(
    'heading',
    { name: '운영진 승인을 기다리고 있어요...' },
    { timeout: 10000 },
  );
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  bridge.result = { status: 'ERROR', code: 'STORAGE', retryable: true };
  await user.click(await screen.findByRole('button', { name: '로그인으로 돌아가기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('로그인 화면으로 돌아가지 못했어요');
  expect(window.location.pathname).toBe('/signup/status');
  expect(screen.queryByRole('button', { name: '구글로 계속하기' })).not.toBeInTheDocument();
  bridge.result = { status: 'SIGNED_OUT' };
  await user.click(screen.getByRole('button', { name: '로그인으로 돌아가기' }));
  await waitFor(() => expect(window.location.pathname).toBe('/login'));
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
}, 15000);

// 첫 진입의 lazy 화면 로딩과 탐색을 포함하므로 내부 10초 대기보다 긴 한도를 둡니다.
it('세션 복구와 로그아웃 후 재로그인 뒤에도 현재 탭을 전환한다', async () => {
  const user = userEvent.setup();
  const client = new QueryClient();
  bridge.getSession.mockResolvedValue(session(1));
  mount(client);

  await screen.findByRole('tab', { name: '일정' }, { timeout: 10000 });
  await user.click(screen.getByRole('tab', { name: '일정' }));
  await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
  expect(screen.getByRole('tab', { name: '일정' })).toHaveAttribute('aria-current', 'page');

  await act(() => apply(client, { status: 'SIGNED_OUT' }, 'logout'));
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();

  await act(() => apply(client, session(2)));
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  await user.click(screen.getByRole('tab', { name: '게시판' }));
  await waitFor(() => expect(window.location.pathname).toBe('/notices'));
  expect(screen.getByRole('tab', { name: '게시판' })).toHaveAttribute('aria-current', 'page');
}, 15000);

it('토큰 갱신은 폼을 유지하고 계정 변경은 이전 폼과 화면을 제거한다', async () => {
  const client = new QueryClient();
  await apply(client, session(1));
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(client);
  const input = await screen.findByRole('checkbox', { name: /강야뿌/ }, { timeout: 10000 });
  await userEvent.click(input);
  expect(input).toBeChecked();
  await act(() => apply(client, session(1, 2)));
  expect(screen.getByRole('checkbox', { name: /강야뿌/ })).toBeChecked();

  await act(() => apply(client, session(2)));
  await waitFor(() =>
    expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument(),
  );
  expect(replaceDocument).not.toHaveBeenCalled();
}, 15000);

it.each(['logout', 'withdraw'] as const)(
  '%s 확정은 reload 없이 보호 화면을 해제한다',
  async (kind) => {
    const client = new QueryClient();
    await apply(client, session(1));
    window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
    mount(client);
    await screen.findByRole('checkbox', { name: /강야뿌/ });
    await act(() =>
      apply(client, { status: kind === 'logout' ? 'SIGNED_OUT' : 'WITHDRAWN' }, kind),
    );
    await waitFor(() =>
      expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument(),
    );
    expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
    expect(replaceDocument).not.toHaveBeenCalled();
    expect(document.documentElement.hidden).toBe(false);
  },
);

it('로그아웃과 B 로그인이 같은 반영에 묶여도 A의 선택값은 남지 않는다', async () => {
  const client = new QueryClient();
  await apply(client, session(1));
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(client);
  await userEvent.click(await screen.findByRole('checkbox', { name: /강야뿌/ }));
  await act(async () => {
    await apply(client, { status: 'SIGNED_OUT' }, 'logout');
    await apply(client, session(2));
  });
  await waitFor(() =>
    expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument(),
  );
});
it('로그아웃 상태로 보호 화면에 직접 접근하면 내용을 표시하지 않고 로그인으로 이동한다', async () => {
  const client = new QueryClient();
  await apply(client, { status: 'SIGNED_OUT' }, 'logout');
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(client);
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
});

it('최종 조회 401은 보호 내용을 숨기고 로그인으로 한 번 이동한다', async () => {
  const client = createAppQueryClient();
  bridge.getSession.mockResolvedValue(session(1));
  bridge.refreshSession.mockResolvedValue(session(1, 2));
  let calls = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () => {
      calls += 1;
      return HttpResponse.json({ status: 401 }, { status: 401 });
    }),
  );
  window.history.replaceState(null, '', '/schedule');
  mount(client);

  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
  expect(screen.queryByRole('list', { name: '세션 일정 목록' })).not.toBeInTheDocument();
  expect(calls).toBe(2);
  expect(bridge.refreshSession).toHaveBeenCalledTimes(1);
});

it('뒤풀이 목록도 WebView 세션을 복구할 수 없으면 내용을 보호한다', async () => {
  const client = new QueryClient();
  bridge.getSession.mockResolvedValue({
    status: 'UNAVAILABLE',
    code: 'NETWORK',
    retryable: true,
  });
  window.history.replaceState(null, '', '/dining');
  mount(client);

  expect(
    await screen.findByRole('heading', { name: '로그인 상태를 확인하지 못했어요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '커뮤니티' })).toBeNull();
});

it('조회 실패는 보호 URL을 유지하며 안내하고 수동 복구 후 원래 화면을 표시한다', async () => {
  const client = new QueryClient();
  bridge.getSession.mockResolvedValueOnce(undefined).mockResolvedValue(session(1));
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(client);
  expect(
    await screen.findByRole('heading', { name: '로그인 상태를 확인하지 못했어요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('checkbox', { name: /강야뿌/ })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');
  expect(bridge.getSession).toHaveBeenCalledTimes(2);
});

it('세션 삭제 실패 후 수동 재시도로 정리되면 보호 내용을 노출하지 않고 로그인으로 이동한다', async () => {
  const user = userEvent.setup();
  const client = new QueryClient();
  let resolveSession: ((result: AuthResult) => void) | undefined;
  const pending = new Promise<AuthResult>((resolve) => {
    resolveSession = resolve;
  });
  bridge.getSession
    .mockResolvedValueOnce({ status: 'ERROR', code: 'STORAGE', retryable: true })
    .mockReturnValueOnce(pending);
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  const view = mount(client);

  expect(
    await screen.findByRole('heading', { name: '로그인 상태를 확인하지 못했어요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');

  await user.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(bridge.getSession).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '구글로 계속하기' })).not.toBeInTheDocument();

  await act(async () => {
    resolveSession?.({ status: 'SIGNED_OUT' });
    await pending;
  });
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(replaceDocument).not.toHaveBeenCalled();
  expect(bridge.getSession).toHaveBeenCalledTimes(2);
  view.unmount();
  client.clear();
});

it('재시도 가능한 세션 조회 실패에서 로그인 화면으로 이동할 수 있다', async () => {
  const client = new QueryClient();
  bridge.getSession.mockResolvedValue({
    status: 'UNAVAILABLE',
    code: 'NETWORK',
    retryable: true,
  });
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(client);
  await userEvent.click(await screen.findByRole('button', { name: '로그인 화면으로' }));
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
});

it('미지원 앱에서는 보호 내용을 숨기고 재시도 없이 업데이트를 안내한다', async () => {
  bridge.getSession.mockResolvedValue({
    status: 'UNAVAILABLE',
    code: 'UNSUPPORTED',
    retryable: false,
  });
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  mount(new QueryClient());
  expect(
    await screen.findByRole('heading', { name: '앱 업데이트가 필요해요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');
});

it('가려진 이전 계정 폼은 재로그인 뒤 back/forward에서도 선택값을 복원하지 않는다', async () => {
  const client = new QueryClient();
  await apply(client, session(1));
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  const { actions } = mount(client);
  await userEvent.click(await screen.findByRole('checkbox', { name: /강야뿌/ }));
  act(() => {
    actions.push('Alerts', {});
  });
  await waitFor(() => expect(window.location.pathname).toBe('/alerts'));
  await act(() => apply(client, { status: 'SIGNED_OUT' }, 'logout'));
  await waitFor(() =>
    expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument(),
  );
  await act(() => apply(client, session(2)));
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  await traverse('back');
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  await traverse('forward');
  await traverse('back');
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
});

const traverse = (direction: 'back' | 'forward') =>
  act(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener('popstate', () => resolve(), { once: true });
        window.history[direction]();
      }),
  );

it('대기 전환 후 새 보호 화면 진입과 이전 폼의 history 복원을 차단한다', async () => {
  const client = new QueryClient();
  await apply(client, session(1));
  window.history.replaceState(null, '', '/team-attendance/upload?sessionId=1');
  const { actions } = mount(client);
  await screen.findByRole('checkbox', { name: /강야뿌/ }, { timeout: 10000 });
  await act(() => actions.push('Alerts', {}));
  await waitFor(() => expect(window.location.pathname).toBe('/alerts'));
  await act(() => apply(client, { status: 'REVIEW_REQUIRED', userId: 1, reviewStatus: 'PENDING' }));
  await waitFor(() => expect(window.location.pathname).toBe('/signup/status'));
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  await act(() => actions.push('Alerts', {}));
  await waitFor(() => expect(window.location.pathname).toBe('/signup/status'));
  expect(screen.queryByRole('heading', { name: '알림' })).not.toBeInTheDocument();
  await traverse('back');
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  await traverse('forward');
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
}, 15000);

it.each(['/attendance/code', '/attendance/report', '/team-attendance/guide'])(
  '로그아웃 상태에서 %s 직접 진입은 시트 없이 로그인으로 이동한다',
  async (path) => {
    vi.stubEnv('VITE_API_MOCKING', 'true');
    const client = new QueryClient();
    await apply(client, { status: 'SIGNED_OUT' }, 'logout');
    window.history.replaceState(null, '', path);
    mount(client);
    expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
  },
);

it.each([false, true])(
  '개발 도구는 로그인 상태 조회 실패=%s에도 열 수 있다',
  async (unavailable) => {
    vi.stubEnv('DEV', true);
    bridge.getSession.mockResolvedValue(unavailable ? undefined : { status: 'SIGNED_OUT' });
    window.history.replaceState(null, '', '/dev/routes');
    mount(new QueryClient());
    expect(await screen.findByRole('heading', { name: '위치 브리지 확인' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dev/routes');
  },
);

it('운영 빌드에서는 개발 경로의 로그인 가드를 유지한다', async () => {
  vi.stubEnv('DEV', false);
  bridge.getSession.mockResolvedValue({ status: 'SIGNED_OUT' });
  window.history.replaceState(null, '', '/dev/routes');
  mount(new QueryClient());
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '위치 브리지 확인' })).not.toBeInTheDocument();
});

it('계정 전환 후 MY는 세션 이름을 표시하지 않는다', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await apply(client, session(1, 1, '가상 회원 A'));
  window.history.replaceState(null, '', '/my');
  const view = mount(client);
  expect(await screen.findByText('테스트 회원')).toBeVisible();
  expect(screen.queryByText('가상 회원 A')).not.toBeInTheDocument();
  expect(await screen.findByText('92점')).toBeVisible();
  await act(() => apply(client, session(2)));
  await waitFor(() => expect(screen.getByText('테스트 회원')).toBeVisible());
  expect(screen.queryByText('가상 회원 A')).not.toBeInTheDocument();
  view.unmount();
  client.clear();
});

vi.mock('@yapp-plus/app-bridge/web', async (importOriginal) => {
  const original = await importOriginal<typeof AppBridgeWeb>();
  // RPC 전송만 대체해 실제 웹 수신 검증과 정규화도 탐색 흐름에 포함합니다.
  const nativeBridge = {
    isNativeMethodAvailable: () => false,
    signIn: () => Promise.resolve(bridge.result),
    completeSignup: () => Promise.resolve(bridge.result),
    signOut: () => Promise.resolve(bridge.result),
    withdraw: () => Promise.resolve(bridge.result),
    getSession: bridge.getSession,
    refreshSession: bridge.refreshSession,
  };
  return {
    ...original,
    getAppBridge: () => nativeBridge,
    pickAttendancePhoto: vi.fn<typeof pickAttendancePhoto>(),
    requestCurrentLocation: nativeLocation.request,
  };
});

it('위치 응답 전에 계정이 바뀌면 이전 계정의 출석을 전송하지 않는다', async () => {
  let respond!: (value: LocationResult) => void;
  nativeLocation.request.mockReturnValue(
    new Promise((resolve) => {
      respond = resolve;
    }),
  );
  vi.spyOn(getAppBridge(), 'isNativeMethodAvailable').mockImplementation(
    (method) => method === 'requestCurrentLocation',
  );
  const verify = vi.fn<() => Response>(() =>
    HttpResponse.json({ verified: true, checkedInAt: '2026-11-07T05:00:00Z' }),
  );
  server.use(
    http.get(`${apiBaseUrl}/api/sessions/current-week`, () =>
      HttpResponse.json({
        ...currentWeekFixture,
        session: {
          ...currentWeekFixture.session,
          attendanceStatus: 'AVAILABLE',
          latitude: 0,
          longitude: 0,
        },
      }),
    ),
    http.post(`${apiBaseUrl}/api/attendance-verifications`, verify),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await apply(client, session(1));
  window.history.replaceState(null, '', '/attendance/code');
  const view = mount(client);
  await screen.findByRole('textbox', { name: '출석 코드 1번째 자리' });
  screen.getAllByRole('textbox').forEach((input, index) => {
    fireEvent.change(input, { target: { value: String(index + 1) } });
  });
  fireEvent.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
  await waitFor(() => expect(nativeLocation.request).toHaveBeenCalledOnce());

  await act(() => apply(client, session(2)));
  act(() => {
    respond({
      status: 'SUCCESS',
      location: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: 1,
        precision: 'precise',
      },
    });
  });

  await waitFor(() => expect(verify).not.toHaveBeenCalled());
  view.unmount();
  client.clear();
});
