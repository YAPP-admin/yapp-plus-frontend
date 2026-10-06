import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPage } from './login';

describe('로그인 화면', () => {
  it('헤더 없이 계정 입력과 로고를 표시한다', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'YAPP Admin' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: '아이디' })).toHaveAttribute(
      'autocomplete',
      'username',
    );
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '회원가입' })).not.toBeInTheDocument();
  });
});
