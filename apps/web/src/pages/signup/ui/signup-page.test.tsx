import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignupPage } from './signup-page';

const router = vi.hoisted(() => ({ push: vi.fn<(url: string) => void>() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
beforeEach(() => vi.clearAllMocks());

function goToPhoneStep() {
  fireEvent.change(screen.getByRole('textbox', { name: '이름을 입력해 주세요' }), {
    target: { value: '김야뿌' },
  });
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  return screen.getByRole('textbox', { name: '휴대폰 번호를 입력해 주세요' });
}

describe('SignupPage', () => {
  it('제목으로 이름 입력창을 안내한다', () => {
    render(<SignupPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '이름을 입력해 주세요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '이름을 입력해 주세요' })).toHaveAttribute(
      'placeholder',
      '본인 이름을 입력해 주세요',
    );
  });

  it('이름을 입력해야 다음 버튼을 누를 수 있다', () => {
    render(<SignupPage />);
    const input = screen.getByRole('textbox', { name: '이름을 입력해 주세요' });
    const next = screen.getByRole('button', { name: '다음' });

    expect(next).toBeDisabled();

    fireEvent.change(input, { target: { value: '   ' } });
    expect(next).toBeDisabled();

    fireEvent.change(input, { target: { value: '김야뿌' } });
    expect(next).toBeEnabled();
  });

  it('이름 다음에 휴대폰 번호 입력 단계를 표시한다', () => {
    render(<SignupPage />);
    const phone = goToPhoneStep();

    expect(
      screen.getByRole('heading', { level: 1, name: '휴대폰 번호를 입력해 주세요' }),
    ).toBeInTheDocument();
    expect(phone).toHaveFocus();
    expect(phone).toHaveAttribute('type', 'tel');
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
  });

  it('휴대폰 번호를 입력하고 다음을 누르면 승인 대기 화면으로 이동한다', () => {
    render(<SignupPage />);
    const phone = goToPhoneStep();
    expect(router.push).not.toHaveBeenCalled();

    fireEvent.change(phone, { target: { value: '010-1234-5678' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(router.push).toHaveBeenCalledWith('/signup/status');
  });
});
