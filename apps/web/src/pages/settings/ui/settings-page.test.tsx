import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Auth from '@/features/auth';
import { SettingsPage } from './settings-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  push: vi.fn<(activityName: string, params: object) => void>(),
  replace: vi.fn<(activityName: string, params: object) => void>(),
  pop: vi.fn<() => void>(),
  isRoot: false,
}));

const authSession = vi.hoisted(() => ({ isNative: false }));

vi.mock('@stackflow/react', () => ({
  useFlow: () => navigation,
  useActivity: () => ({ isRoot: navigation.isRoot, isActive: true }),
}));

vi.mock('@/features/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof Auth>()),
  useNativeAuthSession: () => authSession,
}));

beforeEach(() => {
  vi.clearAllMocks();
  authSession.isNative = false;
});

function renderSettingsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  it('조회 전 알림 스위치 대신 스켈레톤을 표시한다', () => {
    renderSettingsPage();
    expect(screen.queryByRole('switch', { name: '알림' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '알림 설정을 불러오고 있어요' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('설정 헤더와 모든 메뉴 항목을 정상적으로 렌더링한다', () => {
    renderSettingsPage();

    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('개인정보 처리 방침')).toBeInTheDocument();
    expect(screen.getByText('이용 약관')).toBeInTheDocument();
    expect(screen.getByText('회원 탈퇴')).toBeInTheDocument();
    const logoutButton = screen.getByRole('button', { name: '로그아웃' });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton.closest('main')).toBeNull();
  });

  it('브라우저에서는 공개 약관 문서를 새 탭으로 연다', () => {
    renderSettingsPage();

    expect(screen.getByRole('link', { name: '개인정보 처리 방침' })).toHaveAttribute(
      'href',
      'https://yapp-workspace.notion.site/3db2106a0e8480899e28c3788ebeaa6f',
    );
    expect(screen.getByRole('link', { name: '이용 약관' })).toHaveAttribute(
      'href',
      'https://yapp-workspace.notion.site/3db2106a0e84806f91f8d6c4ac97af5f',
    );

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('iOS WebView에서는 외부 URL 처리를 위해 현재 창으로 약관 문서를 연다', () => {
    authSession.isNative = true;
    renderSettingsPage();

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_self');
      expect(link).not.toHaveAttribute('rel');
    }
  });

  it('회원 탈퇴 클릭 시 SEED 다이얼로그가 열리고 탈퇴하기 클릭 시 로그인으로 이동한다', () => {
    renderSettingsPage();

    const withdrawBtn = screen.getByRole('button', { name: /회원 탈퇴/i });
    fireEvent.click(withdrawBtn);

    expect(screen.getByRole('heading', { name: '정말 탈퇴하시겠어요?' })).toBeInTheDocument();
    expect(screen.getByText('탈퇴하시면 모든 정보가 삭제돼요.')).toBeInTheDocument();

    const confirmWithdrawBtn = screen.getByRole('button', { name: '탈퇴하기' });
    fireEvent.click(confirmWithdrawBtn);

    expect(navigation.push).toHaveBeenCalledWith('Login', {});
  });

  it('회원 탈퇴 팝업을 취소하면 닫고 로그인으로 이동하지 않는다', () => {
    renderSettingsPage();

    fireEvent.click(screen.getByRole('button', { name: /회원 탈퇴/i }));
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('heading', { name: '정말 탈퇴하시겠어요?' })).not.toBeInTheDocument();
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it('로그아웃 클릭 시 SEED 다이얼로그가 열리고 로그아웃 확인 클릭 시 로그인으로 이동한다', () => {
    renderSettingsPage();

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

    expect(navigation.push).toHaveBeenCalledWith('Login', {});
  });

  it('로그아웃 팝업을 취소하면 닫고 로그인으로 이동하지 않는다', () => {
    renderSettingsPage();

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('heading', { name: '로그아웃 할까요?' })).not.toBeInTheDocument();
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it('뒤로가기 버튼이 렌더링된다', () => {
    renderSettingsPage();

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });
});
