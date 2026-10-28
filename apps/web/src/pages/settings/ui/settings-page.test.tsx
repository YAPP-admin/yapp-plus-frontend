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

  it('알림 스위치 토글 동작이 상태에 반영된다', () => {
    render(<SettingsPage />);

    const switchBtn = screen.getByRole('switch', { name: '알림 설정' });
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('로그아웃 버튼 클릭 시 로그인 페이지로 이동한다', () => {
    render(<SettingsPage />);

    const logoutBtn = screen.getByRole('button', { name: '로그아웃' });
    fireEvent.click(logoutBtn);

    expect(navigation.push).toHaveBeenCalledWith('/login');
  });

  it('뒤로가기 버튼이 렌더링된다', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });
});
