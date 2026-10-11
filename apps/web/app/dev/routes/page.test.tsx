import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Page from './page';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));
afterEach(() => vi.unstubAllEnvs());

describe('개발용 화면 목록 접근 제한', () => {
  it.each(['production', 'test'])('%s에서는 목록을 렌더링하지 않는다', (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    expect(() => Page()).toThrow('NOT_FOUND');
  });

  it('개발 환경에서는 13개 제품 페이지의 링크만 제공한다', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(<Page />);
    const links = within(screen.getByRole('navigation', { name: '개발용 화면 목록' })).getAllByRole(
      'link',
    );
    expect(links).toHaveLength(13);
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(13);
    expect(screen.getByRole('link', { name: '공지 상세 (예시 ID: 123)' })).toHaveAttribute(
      'href',
      '/notices/123',
    );
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
