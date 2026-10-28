import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginErrorPage } from './login-error-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    replace: vi.fn<(url: string) => void>(),
  }),
}));

describe('LoginErrorPage', () => {
  it('오류 메시지와 그래픽, 문의하기 링크를 정상적으로 렌더링한다', () => {
    render(<LoginErrorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '앗, 문제가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('운영진에게 문의하면 빠르게 해결할 수 있어요')).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: '운영진에게 문의하기' });
    expect(contactLink).toHaveAttribute('href', expect.stringContaining('kakao'));
    expect(contactLink).toHaveAttribute('target', '_blank');
  });

  it('뒤로가기 버튼을 렌더링한다', () => {
    render(<LoginErrorPage />);
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });
});
