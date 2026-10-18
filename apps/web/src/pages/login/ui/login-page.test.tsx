import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from './login-page';

const router = vi.hoisted(() => ({ push: vi.fn<(url: string) => void>() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
beforeEach(() => vi.clearAllMocks());

describe('LoginPage', () => {
  it('로그인 타이틀을 올바르게 표시한다', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /당신의 작은 아이디어가/,
      }),
    ).toBeInTheDocument();
  });

  it('구글 및 애플 소셜 로그인 버튼을 제공한다', () => {
    render(<LoginPage />);
    const googleButton = screen.getByRole('button', { name: '구글로 계속하기' });
    const appleButton = screen.getByRole('button', { name: '애플로 계속하기' });

    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveAttribute('type', 'button');

    expect(appleButton).toBeInTheDocument();
    expect(appleButton).toHaveAttribute('type', 'button');
  });

  it('소셜 로고를 SEED PrefixIcon으로 렌더링하고 스크린 리더에서 숨긴다', () => {
    render(<LoginPage />);

    for (const name of ['구글로 계속하기', '애플로 계속하기']) {
      const icon = screen.getByRole('button', { name }).querySelector('svg');
      expect(icon).toHaveClass('seed-prefix-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('마스코트 일러스트 이미지를 렌더링한다', () => {
    render(<LoginPage />);
    const illust = screen.getByRole('img', { name: '노트북으로 작업 중인 부엉이 캐릭터' });
    expect(illust).toBeInTheDocument();
  });

  it('애플로 계속하기를 누르면 추가 정보 입력 화면으로 이동한다', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: '애플로 계속하기' }));
    expect(router.push).toHaveBeenCalledWith('/signup');
  });
});
