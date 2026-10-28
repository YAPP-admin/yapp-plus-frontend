import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MyPage } from './my-page';

describe('MyPage', () => {
  it('사용자 프로필 정보(이름, 상태 칩, 기수, 직군)를 렌더링한다', () => {
    render(<MyPage />);
    expect(screen.getByText('김야뿌')).toBeInTheDocument();
    expect(screen.getByText('활동회원')).toBeInTheDocument();
    expect(screen.getByText('28기')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('출석 현황 카드(총 점수, 출석 통계 4칸)를 정상적으로 표시한다', () => {
    render(<MyPage />);
    const card = screen.getByLabelText('내 출석 현황');
    expect(within(card).getByText('내 출석 현황')).toBeInTheDocument();
    expect(within(card).getByText('총 점수')).toBeInTheDocument();
    expect(within(card).getByText('92점')).toBeInTheDocument();

    expect(within(card).getByText('출석')).toBeInTheDocument();
    expect(within(card).getByText('3')).toBeInTheDocument();

    expect(within(card).getByText('지각')).toBeInTheDocument();
    expect(within(card).getByText('결석')).toBeInTheDocument();
    expect(within(card).getByText('0')).toBeInTheDocument();
    expect(within(card).getByText('지각 면제권')).toBeInTheDocument();
  });

  it('출석 내역과 이용문의 메뉴 링크를 렌더링한다', () => {
    render(<MyPage />);
    const menuNav = within(screen.getByRole('navigation', { name: '마이페이지 메뉴' }));
    const attendanceLink = menuNav.getByRole('link', { name: /출석 내역/ });
    expect(attendanceLink).toHaveAttribute('href', '/my/attendance');

    const contactLink = menuNav.getByRole('link', { name: /이용문의/ });
    expect(contactLink).toHaveAttribute('href', expect.stringContaining('http'));
  });
});
