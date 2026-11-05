import type { AuthResult } from '@yapp-plus/app-bridge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from './login-page';

const flow = vi.hoisted(() => ({
  push: vi.fn<(activityName: string, params: object) => void>(),
  replace: vi.fn<(activityName: string, params: object) => void>(),
}));
const auth = vi.hoisted(() => {
  type TestSession = {
    isNative: boolean;
    phase: 'BROWSER' | 'LOADING' | 'SIGNED_OUT' | 'SIGNED_IN' | 'UNAVAILABLE';
  };
  type MutationOptions = {
    onSuccess?: (result: AuthResult | undefined) => void;
    onError?: (error: unknown) => void;
  };
  const signInMutate = vi.fn<(provider: 'apple' | 'google', options?: MutationOptions) => void>();
  type TestMutation = { isPending: boolean; mutate: typeof signInMutate };

  return {
    signInWithNative: vi.fn<(provider: 'apple' | 'google') => Promise<AuthResult | undefined>>(),
    signInMutate,
    useNativeSignInMutation: vi.fn<() => TestMutation>(() => ({
      isPending: false,
      mutate: signInMutate,
    })),
    useNativeAuthSession: vi.fn<() => TestSession>(() => ({
      isNative: false,
      phase: 'BROWSER' as const,
    })),
  };
});
vi.mock('@stackflow/react/future', () => ({ useFlow: () => flow }));
vi.mock('@/features/auth', () => auth);
beforeEach(() => vi.clearAllMocks());

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  it('로그인 타이틀을 올바르게 표시한다', () => {
    renderLoginPage();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /당신의 작은 아이디어가/,
      }),
    ).toBeInTheDocument();
  });

  it('구글 및 애플 소셜 로그인 버튼을 제공한다', () => {
    renderLoginPage();
    const googleButton = screen.getByRole('button', { name: '구글로 계속하기' });
    const appleButton = screen.getByRole('button', { name: '애플로 계속하기' });

    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveAttribute('type', 'button');

    expect(appleButton).toBeInTheDocument();
    expect(appleButton).toHaveAttribute('type', 'button');
  });

  it('소셜 로고를 SEED PrefixIcon으로 렌더링하고 스크린 리더에서 숨긴다', () => {
    renderLoginPage();

    for (const name of ['구글로 계속하기', '애플로 계속하기']) {
      const icon = screen.getByRole('button', { name }).querySelector('svg');
      expect(icon).toHaveClass('seed-prefix-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('마스코트 일러스트 이미지를 렌더링한다', () => {
    renderLoginPage();
    const illust = screen.getByRole('img', { name: '노트북으로 작업 중인 부엉이 캐릭터' });
    expect(illust).toBeInTheDocument();
  });

  it('일반 브라우저에서 애플 로그인은 앱 안내를 표시한다', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: '애플로 계속하기' }));
    expect(screen.getByText(/YAPP\+ 앱에서 이용할 수 있어요/)).toBeInTheDocument();
  });

  it('일반 브라우저에서 구글 로그인은 앱 안내를 표시한다', () => {
    renderLoginPage();
    expect(
      screen.queryByRole('heading', { name: '앗, 예기치 못한 오류가 발생했어요!' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '구글로 계속하기' }));

    expect(
      screen.getByRole('heading', { name: '앗, 예기치 못한 오류가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/YAPP\+ 앱에서 이용할 수 있어요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '제보하기' })).toBeInTheDocument();
  });

  it('native 로그인 성공은 세션을 반영하고 홈으로 이동한다', async () => {
    auth.useNativeAuthSession.mockReturnValue({
      isNative: true,
      phase: 'SIGNED_OUT',
    });
    auth.signInWithNative.mockResolvedValue({
      status: 'SIGNED_IN',
      session: {
        accessToken: 'access-token',
        expiresAt: Date.now() + 60_000,
        userId: 1,
        sessionId: 'session-id',
        tokenVersion: 1,
      },
    });
    auth.signInMutate.mockImplementation((provider, options) => {
      void auth.signInWithNative(provider).then(
        (result) => options?.onSuccess?.(result),
        (error: unknown) => options?.onError?.(error),
      );
    });
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: '구글로 계속하기' }));

    await waitFor(() => expect(flow.replace).toHaveBeenCalledWith('Tabs', { initialTab: 'home' }));
    expect(auth.signInMutate).toHaveBeenCalledWith('google', expect.any(Object));
  });
});
