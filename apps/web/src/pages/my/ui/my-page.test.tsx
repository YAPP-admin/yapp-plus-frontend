import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MyPage } from './my-page';

describe('MyPage', () => {
  it('출석 내역과 설정으로 이동하는 링크를 제공한다', () => {
    render(<MyPage />);
    const navigation = within(screen.getByRole('navigation', { name: '마이페이지 바로가기' }));
    expect(navigation.getByRole('link', { name: '출석 내역' })).toHaveAttribute(
      'href',
      '/my/attendance',
    );
    expect(navigation.getByRole('link', { name: '설정' })).toHaveAttribute('href', '/settings');
  });
});
