import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SignupPage } from './signup-page';

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
});
