import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './home-page';

afterEach(() => vi.unstubAllEnvs());

describe('HomePage', () => {
  it.each(['production', 'test'])('%s에서는 개발용 링크를 노출하지 않는다', (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    render(<HomePage />);
    expect(screen.queryByRole('link', { name: '개발용 화면 목록' })).not.toBeInTheDocument();
  });

  it('개발 환경에서만 화면 목록으로 이동할 수 있다', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(<HomePage />);
    expect(screen.getByRole('link', { name: '개발용 화면 목록' })).toHaveAttribute(
      'href',
      '/dev/routes',
    );
  });

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
