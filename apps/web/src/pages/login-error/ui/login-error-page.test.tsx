import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NativeAuthCallbacks } from '@/features/auth/model/mutations';
import { LoginErrorPage } from './login-error-page';

const state = vi.hoisted(() => ({
  limited: false,
  callbacks: {} as NativeAuthCallbacks,
  mutate: vi.fn<(input: undefined) => void>(),
  replace: vi.fn<(activityName: string, params: object) => void>(),
}));
vi.mock('@/features/auth', () => ({
  useNativeAuthSession: () => ({ isNative: state.limited, phase: 'REVIEW_REQUIRED' }),
  useNativeSignOutMutation: (callbacks: NativeAuthCallbacks) => {
    state.callbacks = callbacks;
    return { isPending: false, mutate: state.mutate };
  },
}));
vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isRoot: true }),
  useFlow: () => ({
    pop: vi.fn<() => void>(),
    replace: state.replace,
  }),
}));
beforeEach(() => {
  vi.resetAllMocks();
  state.limited = false;
});

describe('LoginErrorPage', () => {
  it('오류 메시지와 그래픽, 문의하기 링크를 정상적으로 렌더링한다', () => {
    render(<LoginErrorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '앗, 문제가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('운영진에게 문의하면 빠르게 해결할 수 있어요')).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: '운영진에게 문의하기' });
    expect(contactLink).toHaveAttribute('href', 'https://pf.kakao.com/_aGxofd');
    expect(contactLink).toHaveAttribute('target', '_blank');
  });

  it('뒤로가기 버튼을 렌더링한다', () => {
    render(<LoginErrorPage />);
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });

  it('제한 계정은 정리 성공 후 로그인으로 교체한다', async () => {
    state.limited = true;
    const user = userEvent.setup();
    render(<LoginErrorPage />);
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(state.mutate).toHaveBeenCalledWith(undefined);
    expect(state.replace).not.toHaveBeenCalled();
    state.callbacks.onSignedOut?.();
    expect(state.replace).toHaveBeenCalledWith('Login', {});
  });

  it('정리 실패 시 이동하지 않고 재시도할 수 있다', async () => {
    state.limited = true;
    state.mutate.mockImplementation(() => state.callbacks.onFailure?.(undefined));
    const user = userEvent.setup();
    render(<LoginErrorPage />);
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도해 주세요');
    expect(state.replace).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(state.mutate).toHaveBeenCalledTimes(2);
  });
});
