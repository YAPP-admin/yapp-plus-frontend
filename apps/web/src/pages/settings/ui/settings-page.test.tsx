import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './settings-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  push: vi.fn<(url: string) => void>(),
  replace: vi.fn<(url: string) => void>(),
  canGoBack: true,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
  usePathname: () => '/settings',
}));

vi.mock('@/app/navigation/navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));

beforeEach(() => vi.clearAllMocks());

describe('SettingsPage', () => {
  it('설정 헤더와 모든 메뉴 항목을 정상적으로 렌더링한다', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('개인정보 처리 방침')).toBeInTheDocument();
    expect(screen.getByText('이용 약관')).toBeInTheDocument();
    expect(screen.getByText('회원 탈퇴')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('회원 탈퇴 클릭 시 SEED 다이얼로그가 열리고 탈퇴하기 클릭 시 로그인으로 이동한다', () => {
    render(<SettingsPage />);

    const withdrawBtn = screen.getByRole('button', { name: /회원 탈퇴/i });
    fireEvent.click(withdrawBtn);

    expect(screen.getByRole('heading', { name: '정말 탈퇴하시겠어요?' })).toBeInTheDocument();
    expect(screen.getByText('탈퇴하시면 모든 정보가 삭제돼요.')).toBeInTheDocument();

    const confirmWithdrawBtn = screen.getByRole('button', { name: '탈퇴하기' });
    fireEvent.click(confirmWithdrawBtn);

    expect(navigation.push).toHaveBeenCalledWith('/login');
  });

  it('로그아웃 클릭 시 SEED 다이얼로그가 열리고 로그아웃 확인 클릭 시 로그인으로 이동한다', () => {
    render(<SettingsPage />);

    const logoutTrigger = screen.getByRole('button', { name: '로그아웃' });
    fireEvent.click(logoutTrigger);

    expect(screen.getByRole('heading', { name: '로그아웃 할까요?' })).toBeInTheDocument();

    // 다이얼로그 내부의 로그아웃 확인 버튼
    const dialogConfirmBtns = screen.getAllByRole('button', { name: '로그아웃' });
    const confirmBtn = dialogConfirmBtns[dialogConfirmBtns.length - 1];
    expect(confirmBtn).toBeDefined();
    if (confirmBtn) {
      fireEvent.click(confirmBtn);
    }

    expect(navigation.push).toHaveBeenCalledWith('/login');
  });

  it('뒤로가기 버튼이 렌더링된다', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });
});
