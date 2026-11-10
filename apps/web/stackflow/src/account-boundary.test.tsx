import { MutationObserver, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import {
  NativeAuthSessionProvider,
  nativeSignInMutationOptions,
  nativeSignOutMutationOptions,
  nativeSignupMutationOptions,
  nativeWithdrawMutationOptions,
} from '@/features/auth';
import { createStackflowApp } from './stack';

const bridge = vi.hoisted(() => ({
  result: { status: 'SIGNED_OUT' } as AuthResult,
  getSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
const replaceDocument = vi.fn<(url: string | URL) => void>();
const historyListeners: EventListenerOrEventListenerObject[] = [];
const stackflowIntervals = new Set<ReturnType<typeof globalThis.setInterval>>();
const addListener = window.addEventListener.bind(window);
const addInterval = globalThis.setInterval.bind(globalThis);
beforeEach(() => {
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
  vi.useRealTimers();
});
vi.mock('@/features/auth/model/native-auth', () => ({
  signInWithNative: () => Promise.resolve(bridge.result),
  completeNativeSignup: () => Promise.resolve(bridge.result),
  signOutNative: () => Promise.resolve(bridge.result),
  withdrawNative: () => Promise.resolve(bridge.result),
  isNativeWebView: () => true,
  getNativeSession: () => bridge.getSession(),
}));
const context = { platform: 'ios' as const, reducedMotion: true };
const session = (userId: number, tokenVersion = 1, name?: string): AuthResult => ({
  status: 'SIGNED_IN',
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
const mount = (client: QueryClient) => {
  const { Stack, actions } = createStackflowApp({ reducedMotion: true, queryClient: client });
  const view = render(
    <QueryClientProvider client={client}>
      <Suspense fallback="로딩 중">
        <NativeAuthSessionProvider>
          <Stack initialContext={context} />
        </NativeAuthSessionProvider>
      </Suspense>
    </QueryClientProvider>,
  );
  return { ...view, actions };
};

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
  window.history.replaceState(null, '', '/team-attendance/upload');
  mount(client);
  const input = await screen.findByRole('checkbox', { name: /강야뿌/ }, { timeout: 10000 });
  await userEvent.click(input);
  expect(input).toBeChecked();
  await act(() => apply(client, session(1, 2)));
  expect(screen.getByRole('checkbox', { name: /강야뿌/ })).toBeChecked();

  await act(() => apply(client, session(2)));
  await waitFor(() => expect(screen.getByRole('checkbox', { name: /강야뿌/ })).not.toBeChecked());
  expect(replaceDocument).not.toHaveBeenCalled();
}, 15000);

it.each(['logout', 'withdraw'] as const)(
  '%s 확정은 reload 없이 보호 화면을 해제한다',
  async (kind) => {
    const client = new QueryClient();
    await apply(client, session(1));
    window.history.replaceState(null, '', '/team-attendance/upload');
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
  window.history.replaceState(null, '', '/team-attendance/upload');
  mount(client);
  await userEvent.click(await screen.findByRole('checkbox', { name: /강야뿌/ }));
  await act(async () => {
    await apply(client, { status: 'SIGNED_OUT' }, 'logout');
    await apply(client, session(2));
  });
  await waitFor(() => expect(screen.getByRole('checkbox', { name: /강야뿌/ })).not.toBeChecked());
});

it('로그아웃 상태로 보호 화면에 직접 접근하면 내용을 표시하지 않고 로그인으로 이동한다', async () => {
  const client = new QueryClient();
  await apply(client, { status: 'SIGNED_OUT' }, 'logout');
  window.history.replaceState(null, '', '/team-attendance/upload');
  mount(client);
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
});

it('조회 실패는 보호 URL을 유지하며 안내하고 수동 복구 후 원래 화면을 표시한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  const client = new QueryClient();
  bridge.getSession.mockResolvedValueOnce(undefined).mockResolvedValue(session(1));
  window.history.replaceState(null, '', '/team-attendance/upload');
  mount(client);
  expect(
    await screen.findByRole('heading', { name: '로그인 상태를 확인하지 못했어요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(bridge.getSession).toHaveBeenCalledTimes(1);
  vi.setSystemTime(Date.now() + 5001);
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByRole('checkbox', { name: /강야뿌/ })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');
  expect(bridge.getSession).toHaveBeenCalledTimes(2);
});

it('세션 삭제 실패 후 수동 재시도로 정리되면 보호 내용을 노출하지 않고 로그인으로 이동한다', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  const user = userEvent.setup();
  const client = new QueryClient();
  let resolveSession: ((result: AuthResult) => void) | undefined;
  const pending = new Promise<AuthResult>((resolve) => {
    resolveSession = resolve;
  });
  bridge.getSession
    .mockResolvedValueOnce({ status: 'ERROR', code: 'STORAGE', retryable: true })
    .mockReturnValueOnce(pending);
  window.history.replaceState(null, '', '/team-attendance/upload');
  const view = mount(client);

  expect(
    await screen.findByRole('heading', { name: '로그인 상태를 확인하지 못했어요' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument();
  expect(window.location.pathname).toBe('/team-attendance/upload');

  // Date만 이동시켜 자동 재조회 타이머와 수동 버튼의 효과를 구분합니다.
  vi.setSystemTime(Date.now() + 5001);
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
  window.history.replaceState(null, '', '/team-attendance/upload');
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
  window.history.replaceState(null, '', '/team-attendance/upload');
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
  window.history.replaceState(null, '', '/team-attendance/upload');
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
  expect(await screen.findByRole('checkbox', { name: /강야뿌/ })).not.toBeChecked();
  await traverse('forward');
  await traverse('back');
  expect(await screen.findByRole('checkbox', { name: /강야뿌/ })).not.toBeChecked();
});

const traverse = (direction: 'back' | 'forward') =>
  act(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener('popstate', () => resolve(), { once: true });
        window.history[direction]();
      }),
  );

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

it('이름 없는 새 계정으로 전환하면 MY의 이전 이름이 제거된다', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await apply(client, session(1, 1, '가상 회원 A'));
  window.history.replaceState(null, '', '/my');
  const view = mount(client);
  expect(await screen.findByText('가상 회원 A')).toBeVisible();
  expect(await screen.findByText('92점')).toBeVisible();
  await act(() => apply(client, session(2)));
  await waitFor(() => expect(screen.queryByText('가상 회원 A')).not.toBeInTheDocument());
  expect(screen.getByRole('region', { name: '프로필 및 출석 현황' })).toHaveTextContent('—');
  view.unmount();
  client.clear();
});
