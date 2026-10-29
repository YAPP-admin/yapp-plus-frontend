import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { LoginPage } from './login-page';

it('alias 스타일을 사용하는 실제 로그인 화면을 렌더링한다', () => {
  render(<LoginPage />);

  expect(screen.getByRole('heading', { name: '로그인', level: 1 })).toBeVisible();
  expect(screen.getByText('카카오·Apple로 계속하기를 준비하고 있어요.')).toBeVisible();
});
