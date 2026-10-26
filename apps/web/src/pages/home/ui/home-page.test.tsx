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

  it('세션 정보, 주간 캘린더, 출석하기 버튼을 렌더링한다', () => {
    render(<HomePage />);
    expect(screen.getByText('DMC 첨단산업센터')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주는 유저 플로우 리뷰 세션이에요' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('주간 일정')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '출석하기' })).toHaveAttribute(
      'href',
      '/my/attendance',
    );
  });

  it('일정 및 출결 보고 바로가기 카드를 제공한다', () => {
    render(<HomePage />);
    const navigation = within(screen.getByRole('navigation', { name: '홈 바로가기' }));
    expect(navigation.getByRole('link', { name: '이번 달 세션 전체보기' })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(navigation.getByRole('link', { name: '최근 출석 전체보기' })).toHaveAttribute(
      'href',
      '/my/attendance',
    );
  });

  it('이번 주 공지 목록을 제공한다', () => {
    render(<HomePage />);
    const section = screen.getByRole('region', { name: '이번 주 공지' });
    expect(
      within(section).getByRole('heading', { level: 2, name: '이번 주 공지' }),
    ).toBeInTheDocument();
    expect(within(section).getByText('5주차 개발-디자인 세션 공지')).toBeInTheDocument();
    expect(within(section).getByText('뒷풀이 참석 여부 수요 조사')).toBeInTheDocument();
    expect(within(section).getByText('운영진 공지 사항')).toBeInTheDocument();
  });
});
