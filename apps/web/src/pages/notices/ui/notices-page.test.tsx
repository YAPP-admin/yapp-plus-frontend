import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTICES, NoticesPage } from './notices-page';

describe('NoticesPage', () => {
  it('게시판 기본 목록과 탭을 정상적으로 렌더링한다', () => {
    render(<NoticesPage />);

    expect(screen.getByRole('heading', { level: 1, name: '게시판' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '게시판 카테고리' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '공지사항 목록' })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: '전체' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '세션' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '과제' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '기타' })).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: '팀빌딩 소개서 작성' }),
    ).toBeInTheDocument();
    expect(screen.getByText('D-2')).toBeInTheDocument();
    expect(screen.getByText('2026.09.30 (수)')).toBeInTheDocument();
  });

  it('카테고리 탭을 클릭하면 해당 카테고리의 공지사항만 필터링된다', () => {
    render(<NoticesPage />);

    // '세션' 탭 클릭
    const sessionTab = screen.getByRole('tab', { name: '세션' });
    fireEvent.click(sessionTab);

    expect(
      screen.getByRole('heading', { level: 2, name: '3주차 팀빌딩 세션 공지' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: '팀빌딩 소개서 작성' }),
    ).not.toBeInTheDocument();
  });

  it('공지사항이 빈 배열일 때 빈 상태(아직 작성된 공지사항이 없어요)를 렌더링한다', () => {
    render(<NoticesPage notices={[]} />);

    expect(screen.getByRole('status', { name: '공지사항 없음' })).toBeInTheDocument();
    expect(screen.getByText('아직 작성된 공지사항이 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '공지사항 목록' })).not.toBeInTheDocument();
  });

  it('개별 공지사항 아이템에 상세 링크가 올바르게 연결된다', () => {
    render(<NoticesPage notices={DEFAULT_NOTICES.slice(0, 1)} />);

    const link = screen.getByRole('link', { name: /과제 공지: 팀빌딩 소개서 작성/ });
    expect(link).toHaveAttribute('href', '/notices/1');
  });
});
