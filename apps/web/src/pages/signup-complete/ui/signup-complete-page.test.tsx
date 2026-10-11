import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignupCompletePage } from './signup-complete-page';

describe('SignupCompletePage', () => {
  it('가입 결과를 표시하지 않는 준비 화면에서 홈으로 이동할 수 있다', () => {
    render(<SignupCompletePage />);
    expect(screen.getByText(/현재 가입 결과는 표시되지 않아요/)).toBeVisible();
    expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
