import { fireEvent, render, screen } from '@testing-library/react';
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
  it('확인된 내부 이력이 있으면 실제 브라우저 뒤로가기를 사용한다', () => {
    navigation.canGoBack.mockReturnValue(true);
    render(<BackButton fallback="/my" />);
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(navigation.back).toHaveBeenCalledOnce();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it.each(['/my', '/my/attendance', '/notices'])(
    '내부 이력이 없으면 %s로 replace한다',
    (fallback) => {
      navigation.canGoBack.mockReturnValue(false);
      render(<BackButton fallback={fallback} />);
      fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));
      expect(navigation.replace).toHaveBeenCalledWith(fallback);
      expect(navigation.back).not.toHaveBeenCalled();
    },
  );
});
