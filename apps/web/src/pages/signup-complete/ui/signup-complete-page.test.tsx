import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignupCompletePage } from './signup-complete-page';

describe('SignupCompletePage', () => {
  it('가입 완료 안내와 홈으로 가는 시작하기 링크를 제공한다', () => {
    render(<SignupCompletePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: '회원가입을 완료했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '시작하기' })).toHaveAttribute('href', '/');
  });
});
