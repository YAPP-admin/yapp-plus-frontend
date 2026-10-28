import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NoticeErrorPage } from './notice-error-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  replace: vi.fn<(url: string) => void>(),
  canGoBack: vi.fn<() => boolean>(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('@/app/navigation/navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));
beforeEach(() => vi.clearAllMocks());

describe('NoticeErrorPage', () => {
  it('오류 메시지와 설명을 정상적으로 렌더링한다', () => {
    render(<NoticeErrorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 기본 fallback 경로(/notices)로 이동한다', () => {
    navigation.canGoBack.mockReturnValue(false);
    render(<NoticeErrorPage fallbackUrl="/notices" />);

    const backButton = screen.getByRole('button', { name: '뒤로가기' });
    fireEvent.click(backButton);

    expect(navigation.replace).toHaveBeenCalledWith('/notices');
  });
});
