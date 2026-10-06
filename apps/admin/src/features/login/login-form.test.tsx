import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';
import type { Login, LoginResult } from './login';

const invalid: LoginResult = { status: 'invalid-credentials' };

function setup(login = vi.fn<Login>().mockResolvedValue(invalid), available = true) {
  const onSuccess = vi.fn<() => void>();
  const user = userEvent.setup();
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <LoginForm login={login} onSuccess={onSuccess} available={available} />
    </QueryClientProvider>,
  );

  const username = screen.getByRole('textbox', { name: '아이디' });
  const password = screen.getByLabelText('비밀번호');
  const submit = screen.getByRole('button', { name: '로그인' });

  return { user, login, onSuccess, username, password, submit };
}

describe('로그인 폼', () => {
  it('최초 제출부터 검증하고 오류 필드에 포커스를 옮긴다', async () => {
    const { user, username, password, submit, login } = setup();

    await user.click(username);
    await user.tab();

    expect(username).not.toHaveAttribute('aria-invalid', 'true');

    await user.click(submit);

    expect(await screen.findByText('아이디를 입력해주세요.')).toBeVisible();
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeVisible();
    await waitFor(() => expect(username).toHaveFocus());
    expect(login).not.toHaveBeenCalled();

    await user.type(username, 'admin-demo');

    expect(screen.queryByText('아이디를 입력해주세요.')).not.toBeInTheDocument();

    await user.click(submit);
    await waitFor(() => expect(password).toHaveFocus());
  });

  it('아이디만 정규화하고 Enter로 제출한다', async () => {
    const { user, username, password, login, onSuccess } = setup(
      vi.fn<Login>().mockResolvedValue({ status: 'success' }),
    );

    await user.type(username, '  admin-demo  ');
    await user.type(password, ' password with spaces ');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(login).toHaveBeenCalledExactlyOnceWith({
      username: 'admin-demo',
      password: ' password with spaces ',
    });
  });

  it('제출 중 입력을 잠그고 연속 제출을 막는다', async () => {
    let resolveRequest: ((result: LoginResult) => void) | undefined;
    const request = new Promise<LoginResult>((resolve) => {
      resolveRequest = resolve;
    });
    const { user, username, password, submit, login } = setup(
      vi.fn<Login>().mockReturnValue(request),
    );

    await user.type(username, 'admin-demo');
    await user.type(password, 'wrong');
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    expect(username).toHaveAttribute('readonly');
    expect(password).toHaveAttribute('readonly');
    expect(submit).toHaveAttribute('aria-busy', 'true');

    fireEvent.submit(screen.getByRole('form', { name: '관리자 로그인' }));

    expect(login).toHaveBeenCalledOnce();

    await act(async () => {
      resolveRequest?.(invalid);
      await request;
    });

    expect(await screen.findByText('아이디 혹은 비밀번호가 일치하지 않아요.')).toBeVisible();
    expect(submit).toBeEnabled();
    expect(password).not.toHaveAttribute('readonly');
  });

  it('실패 입력을 유지하고 수정 후 재시도할 수 있다', async () => {
    const login = vi
      .fn<Login>()
      .mockResolvedValueOnce(invalid)
      .mockResolvedValue({ status: 'success' });
    const { user, username, password, submit, onSuccess } = setup(login);

    await user.type(username, 'admin-demo');
    await user.type(password, 'wrong');
    await user.click(submit);

    const message = await screen.findByText('아이디 혹은 비밀번호가 일치하지 않아요.');

    expect(message).toHaveAttribute('role', 'alert');
    expect(username).toHaveValue('admin-demo');
    expect(password).toHaveValue('wrong');
    expect(onSuccess).not.toHaveBeenCalled();

    await user.clear(password);

    expect(screen.queryByText('아이디 혹은 비밀번호가 일치하지 않아요.')).not.toBeInTheDocument();

    await user.type(password, 'demo-password');
    await user.click(submit);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it.each(['response', 'exception'])(
    '서비스 오류를 안내하고 제출 잠금을 해제한다: %s',
    async (mode) => {
      const login = vi.fn<Login>();
      if (mode === 'response') {
        login.mockResolvedValue({ status: 'unavailable' });
      } else {
        login.mockRejectedValue(new Error('테스트용 실패'));
      }

      const { user, username, password, submit, onSuccess } = setup(login);

      await user.type(username, 'admin-demo');
      await user.type(password, 'wrong');
      await user.click(submit);

      expect(
        await screen.findByText('로그인할 수 없어요. 잠시 후 다시 시도해주세요.'),
      ).toBeVisible();
      expect(submit).toBeEnabled();
      expect(onSuccess).not.toHaveBeenCalled();
    },
  );

  it('사용 불가 환경에서는 클릭과 Enter 모두 로그인 함수를 호출하지 않는다', async () => {
    const { user, username, password, submit, login } = setup(vi.fn<Login>(), false);

    expect(screen.getByText('로그인 기능을 준비 중입니다.')).toBeVisible();
    expect(submit).toBeDisabled();

    await user.type(username, 'admin-demo');
    await user.type(password, 'demo-password{Enter}');
    fireEvent.submit(screen.getByRole('form', { name: '관리자 로그인' }));

    expect(login).not.toHaveBeenCalled();
  });
});
