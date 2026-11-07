import type { NativeAuthCallbacks } from '@/features/auth';
import type { CompleteSignupInput } from '@yapp-plus/app-bridge';
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
  const state: { callbacks: NativeAuthCallbacks } = { callbacks: {} };
  const signupMutate = vi.fn<(input: CompleteSignupInput) => void>();
  type TestMutation = { isPending: boolean; mutate: typeof signupMutate };
  return {
    state,
    signupMutate,
    useNativeSignupMutation: vi.fn<(callbacks?: NativeAuthCallbacks) => TestMutation>(
      (callbacks = {}) => {
        state.callbacks = callbacks;
        return { isPending: false, mutate: signupMutate };
      },
    ),
    useNativeAuthSession: vi.fn<() => TestSession>(() => ({
      isNative: false,
      phase: 'BROWSER' as const,
    })),
  };
});
vi.mock('@stackflow/react', () => ({ useFlow: () => flow }));
vi.mock('@/features/auth', () => auth);
beforeEach(() => {
  vi.clearAllMocks();
  auth.signupMutate.mockReset();
  auth.useNativeAuthSession.mockReturnValue({ isNative: false, phase: 'BROWSER' });
});

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
  it('서버의 휴대폰 오류를 입력에 연결하고 수정하면 해제한다', async () => {
    auth.useNativeAuthSession.mockReturnValue({ isNative: true, phase: 'SIGNED_OUT' });
    auth.signupMutate.mockImplementation(() =>
      auth.state.callbacks.onFailure?.({
        status: 'ERROR',
        code: 'INVALID_INPUT',
        retryable: false,
        fieldErrors: [{ field: 'phoneNumber', code: 'INVALID_FORMAT' }],
      }),
    );
    renderSignupPage();
    const phone = await goToPhoneStep();
    fireEvent.change(phone, { target: { value: '010' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    await waitFor(() => expect(phone).toHaveAttribute('aria-invalid', 'true'));
    expect(phone).toHaveAccessibleDescription('휴대폰 번호 형식을 확인해 주세요.');
    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    expect(phone).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('휴대폰 번호 형식을 확인해 주세요.')).not.toBeInTheDocument();
  });

  it('이름과 휴대폰 오류가 함께 오면 이름부터 수정하고 휴대폰 오류를 보존한다', async () => {
    auth.useNativeAuthSession.mockReturnValue({ isNative: true, phase: 'SIGNED_OUT' });
    auth.signupMutate.mockImplementation(() =>
      auth.state.callbacks.onFailure?.({
        status: 'ERROR',
        code: 'INVALID_INPUT',
        retryable: false,
        fieldErrors: [
          { field: 'name', code: 'TOO_LONG' },
          { field: 'phoneNumber', code: 'ALREADY_EXISTS' },
        ],
      }),
    );
    renderSignupPage();
    const phone = await goToPhoneStep();
    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    const name = await screen.findByRole('textbox', { name: '이름을 입력해 주세요' });
    expect(name).toHaveAccessibleDescription('이름이 너무 길어요.');
    expect(name).toHaveFocus();
    fireEvent.change(name, { target: { value: '수정 이름' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: '휴대폰 번호를 입력해 주세요' }),
      ).toHaveAccessibleDescription('이미 사용 중인 휴대폰 번호입니다.'),
    );
    expect(auth.signupMutate).toHaveBeenCalledTimes(1);
  });

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

  it('native 가입 요청을 전달하고 성공하면 완료 화면으로 이동한다', async () => {
    auth.useNativeAuthSession.mockReturnValue({
      isNative: true,
      phase: 'SIGNED_OUT',
    });
    auth.signupMutate.mockImplementation(() => auth.state.callbacks.onSignedIn?.());
    renderSignupPage();
    const phone = await goToPhoneStep();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(flow.replace).toHaveBeenCalledWith('SignupComplete', {}));
    await waitFor(() =>
      expect(auth.signupMutate).toHaveBeenCalledWith({
        name: '김야뿌',
        phoneNumber: '010-1234-5678',
      }),
    );
  });
});
