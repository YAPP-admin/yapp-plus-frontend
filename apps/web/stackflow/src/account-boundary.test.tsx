import { MutationObserver, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, Suspense } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import {
  NativeAuthSessionProvider,
  nativeSignInMutationOptions,
  nativeSignOutMutationOptions,
  nativeSignupMutationOptions,
} from '@/features/auth';
import { createStackflowApp } from './stack';

const bridge = vi.hoisted(() => ({
  result: { status: 'SIGNED_OUT' } as AuthResult,
  getSession: vi.fn<() => Promise<AuthResult | undefined>>(),
}));
afterEach(() => {
  bridge.getSession.mockReset();
  vi.useRealTimers();
});
vi.mock('@/features/auth/model/native-auth', () => ({
  signInWithNative: () => Promise.resolve(bridge.result),
  completeNativeSignup: () => Promise.resolve(bridge.result),
  signOutNative: () => Promise.resolve(bridge.result),
  isNativeWebView: () => true,
  getNativeSession: () => bridge.getSession(),
}));
const context = { platform: 'ios' as const, reducedMotion: true };
const session = (userId: number, tokenVersion = 1): AuthResult => ({
  status: 'SIGNED_IN',
  session: {
    userId,
    sessionId: `session-${userId}`,
    tokenVersion,
    accessToken: 'test',
    expiresAt: 999999,
  },
});
const apply = (
  client: QueryClient,
  result: AuthResult,
  kind: 'authenticate' | 'signup' | 'logout' = 'authenticate',
) => {
  bridge.result = result;
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
  const { Stack } = createStackflowApp({ reducedMotion: true });
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <Suspense fallback="로딩 중">
          <NativeAuthSessionProvider>
            <Stack initialContext={context} />
          </NativeAuthSessionProvider>
        </Suspense>
      </QueryClientProvider>
    </StrictMode>,
  );
};

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
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  await waitFor(() =>
    expect(screen.queryByRole('checkbox', { name: /강야뿌/ })).not.toBeInTheDocument(),
  );
}, 15000);

it('가입 확정은 가입 완료 화면으로 이동하고 로그아웃은 로그인으로 초기화한다', async () => {
  const client = new QueryClient();
  await apply(client, { status: 'SIGNED_OUT' }, 'logout');
  window.history.replaceState(null, '', '/signup');
  mount(client);
  await screen.findByRole('textbox', { name: '이름을 입력해 주세요' }, { timeout: 10000 });

  await act(() => apply(client, session(1), 'signup'));
  expect(
    await screen.findByRole('heading', { name: '회원가입을 완료했어요!' }),
  ).toBeInTheDocument();
  await act(() => apply(client, { status: 'SIGNED_OUT' }, 'logout'));
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
  expect(await screen.findByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
  await traverseHistory('back');
  await waitFor(() => expect(window.location.pathname).toMatch(/^\/login\/?$/));
  expect(screen.queryByRole('heading', { name: '회원가입을 완료했어요!' })).not.toBeInTheDocument();
});

/** URL 검사가 popstate 이전에 통과하지 않도록 실제 이력 이동을 기다립니다. */
async function traverseHistory(direction: 'back' | 'forward') {
  await act(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener('popstate', () => resolve(), { once: true });
        window.history[direction]();
      }),
  );
}

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
