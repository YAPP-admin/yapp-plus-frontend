import { render, screen, waitFor, within } from '@testing-library/react';
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

  it('출석 현황 카드의 ? 버튼을 누르면 SEED 출석 규칙 다이얼로그가 열리고 확인 버튼으로 닫힌다', async () => {
    render(<MyPage />);
    const questionBtn = screen.getByRole('button', { name: '출석 규칙 안내' });
    expect(screen.queryByRole('heading', { name: '출석 규칙' })).not.toBeInTheDocument();

    questionBtn.click();

    const heading = await screen.findByRole('heading', { name: '출석 규칙' });
    expect(heading).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('1시간 지각/조퇴')).toBeInTheDocument();
    expect(within(dialog).getByText('-4점')).toBeInTheDocument();
    expect(within(dialog).getByText('결석')).toBeInTheDocument();
    expect(within(dialog).getByText('-12점')).toBeInTheDocument();
    expect(within(dialog).getByText(/총 40점 미만의 회원은/)).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole('button', { name: '확인' });
    confirmBtn.click();

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '출석 규칙' })).not.toBeInTheDocument();
    });
  });
});
