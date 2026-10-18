/** 내부 방문 이력에 따라 뒤로가기 또는 대체 경로 이동을 검증합니다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackButton } from './back-button';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  replace: vi.fn<(url: string) => void>(),
  canGoBack: vi.fn<() => boolean>(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('./navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));
beforeEach(() => vi.clearAllMocks());

describe('BackButton', () => {
  it('확인된 내부 이력이 있으면 실제 브라우저 뒤로가기를 사용한다', async () => {
    const user = userEvent.setup();
    navigation.canGoBack.mockReturnValue(true);
    render(<BackButton fallback="/my" />);

    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(navigation.back).toHaveBeenCalledOnce();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it.each(['/my', '/my/attendance', '/notices'])(
    '내부 이력이 없으면 %s로 replace한다',
    async (fallback) => {
      const user = userEvent.setup();
      navigation.canGoBack.mockReturnValue(false);
      render(<BackButton fallback={fallback} />);

      await user.click(screen.getByRole('button', { name: '뒤로가기' }));
      expect(navigation.replace).toHaveBeenCalledWith(fallback);
      expect(navigation.back).not.toHaveBeenCalled();
    },
  );
});
