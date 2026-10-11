import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('준비 중 안내와 일정·공지·출석 바로가기를 제공한다', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: '홈' })).toBeVisible();
    expect(screen.getByText('화면을 준비하고 있어요.')).toBeVisible();
    const navigation = within(screen.getByRole('navigation', { name: '홈 바로가기' }));
    expect(navigation.getByRole('link', { name: '이번 달 세션 전체보기' })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(navigation.getByRole('link', { name: '공지 더보기' })).toHaveAttribute(
      'href',
      '/notices',
    );
    expect(navigation.getByRole('link', { name: '최근 출석 전체보기' })).toHaveAttribute(
      'href',
      '/my/attendance',
    );
  });
});
