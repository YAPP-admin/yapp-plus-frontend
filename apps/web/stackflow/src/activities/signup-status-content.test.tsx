/** 복귀 확인에서 취소·성공·실패가 탐색과 native 정리를 올바르게 연결하는지 검증합니다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import type { NativeAuthCallbacks } from '@/features/auth/model/mutations';
import { SignupStatusContent } from './signup-status-content';

const state = vi.hoisted(() => ({
  callbacks: {} as NativeAuthCallbacks,
  pending: false,
  mutate: vi.fn<(input: undefined) => void>(),
  replace: vi.fn<(name: string, params: object) => void>(),
}));
vi.mock('@stackflow/react', () => ({ useFlow: () => ({ replace: state.replace }) }));
vi.mock('@/features/auth', () => ({
  useNativeAuthSession: () => ({ isNative: true }),
  useNativeSignOutMutation: (callbacks: NativeAuthCallbacks) => {
    state.callbacks = callbacks;
    return { isPending: state.pending, mutate: state.mutate };
  },
}));
beforeEach(() => {
  vi.resetAllMocks();
  state.pending = false;
});

it('정리 중에는 확인·취소를 비활성화하고 재요청하지 않는다', async () => {
  const user = userEvent.setup();
  const view = render(<SignupStatusContent />);
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  await user.click(await screen.findByRole('button', { name: '로그인으로 돌아가기' }));
  state.pending = true;
  view.rerender(<SignupStatusContent />);
  const confirm = screen.getByRole('button', { name: '로그인으로 돌아가기' });
  expect(confirm).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  await user.click(confirm);
  expect(state.mutate).toHaveBeenCalledTimes(1);
  expect(state.replace).not.toHaveBeenCalled();
});

it('취소는 대기 화면을 유지하고 native 정리를 요청하지 않는다', async () => {
  const user = userEvent.setup();
  render(<SignupStatusContent />);
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  expect(await screen.findByRole('dialog')).toHaveAccessibleName('로그인 화면으로 돌아갈까요?');
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(state.mutate).not.toHaveBeenCalled();
  expect(state.replace).not.toHaveBeenCalled();
});

it('확인은 native 정리를 요청하고 탐색은 인증 경계에 맡긴다', async () => {
  const user = userEvent.setup();
  render(<SignupStatusContent />);
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  await user.click(await screen.findByRole('button', { name: '로그인으로 돌아가기' }));
  expect(state.mutate).toHaveBeenCalledWith(undefined);
  expect(state.replace).not.toHaveBeenCalled();
  expect(state.callbacks.onSignedOut).toBeUndefined();
});

it('정리 실패는 오류를 표시하고 재시도를 허용한다', async () => {
  const user = userEvent.setup();
  state.mutate.mockImplementation(() => state.callbacks.onFailure?.(undefined));
  render(<SignupStatusContent />);
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  await user.click(await screen.findByRole('button', { name: '로그인으로 돌아가기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도해 주세요');
  expect(state.replace).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '로그인으로 돌아가기' }));
  expect(state.mutate).toHaveBeenCalledTimes(2);
});
