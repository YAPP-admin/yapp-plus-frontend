import type { AuthResult, CompleteSignupInput } from '@yapp-plus/app-bridge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignupPage } from './signup-page';

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
  const signupMutate = vi.fn<(input: CompleteSignupInput, options?: MutationOptions) => void>();
  type TestMutation = { isPending: boolean; mutate: typeof signupMutate };

  return {
    completeNativeSignup: vi.fn<(input: CompleteSignupInput) => Promise<AuthResult | undefined>>(),
    signupMutate,
    useNativeSignupMutation: vi.fn<() => TestMutation>(() => ({
      isPending: false,
      mutate: signupMutate,
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

function renderSignupPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <SignupPage />
    </QueryClientProvider>,
  );
}

async function goToPhoneStep() {
  fireEvent.change(screen.getByRole('textbox', { name: '이름을 입력해 주세요' }), {
    target: { value: '김야뿌' },
  });
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  return waitFor(() => screen.getByRole('textbox', { name: '휴대폰 번호를 입력해 주세요' }));
}

describe('SignupPage', () => {
  it('제목으로 이름 입력창을 안내한다', () => {
    renderSignupPage();

    expect(
      screen.getByRole('heading', { level: 1, name: '이름을 입력해 주세요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '이름을 입력해 주세요' })).toHaveAttribute(
      'placeholder',
      '본인 이름을 입력해 주세요',
    );
  });

  it('이름을 입력해야 다음 버튼을 누를 수 있다', () => {
    renderSignupPage();
    const input = screen.getByRole('textbox', { name: '이름을 입력해 주세요' });
    const next = screen.getByRole('button', { name: '다음' });

    expect(next).toBeDisabled();

    fireEvent.change(input, { target: { value: '   ' } });
    expect(next).toBeDisabled();

    fireEvent.change(input, { target: { value: '김야뿌' } });
    expect(next).toBeEnabled();
  });

  it('이름 다음에 휴대폰 번호 입력 단계를 표시한다', async () => {
    renderSignupPage();
    const phone = await goToPhoneStep();

    expect(
      screen.getByRole('heading', { level: 1, name: '휴대폰 번호를 입력해 주세요' }),
    ).toBeInTheDocument();
    expect(phone).toHaveFocus();
    expect(phone).toHaveAttribute('type', 'tel');
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
  });

  it('휴대폰 번호를 입력하고 다음을 누르면 승인 대기 화면으로 이동한다', async () => {
    renderSignupPage();
    const phone = await goToPhoneStep();
    expect(flow.push).not.toHaveBeenCalled();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    await waitFor(() => expect(flow.push).toHaveBeenCalledWith('SignupStatus', {}));
  });

  it('native 가입 성공은 가입 완료 화면으로 이동한다', async () => {
    auth.useNativeAuthSession.mockReturnValue({
      isNative: true,
      phase: 'SIGNED_OUT',
    });
    auth.completeNativeSignup.mockResolvedValue({
      status: 'SIGNED_IN',
      session: {
        accessToken: 'access-token',
        expiresAt: Date.now() + 60_000,
        userId: 1,
        sessionId: 'session-id',
        tokenVersion: 1,
      },
    });
    auth.signupMutate.mockImplementation((input, options) => {
      void auth.completeNativeSignup(input).then(
        (result) => options?.onSuccess?.(result),
        (error: unknown) => options?.onError?.(error),
      );
    });
    renderSignupPage();
    const phone = await goToPhoneStep();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(flow.replace).toHaveBeenCalledWith('SignupComplete', {}));
    expect(auth.signupMutate).toHaveBeenCalledWith(
      { name: '김야뿌', phoneNumber: '010-1234-5678' },
      expect.any(Object),
    );
    expect(auth.completeNativeSignup.mock.calls[0]?.[0]).toEqual({
      name: '김야뿌',
      phoneNumber: '010-1234-5678',
    });
  });
});
