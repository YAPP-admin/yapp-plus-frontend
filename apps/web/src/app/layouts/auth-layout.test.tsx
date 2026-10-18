import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthLayout } from './auth-layout';

const location = vi.hoisted(() => ({ segments: [] as string[] }));
vi.mock('next/navigation', () => ({
  useSelectedLayoutSegments: () => location.segments,
  useRouter: () => ({ back: vi.fn<() => void>(), replace: vi.fn<(url: string) => void>() }),
}));

describe('AuthLayout', () => {
  it('가입 정보 입력 화면에만 뒤로가기를 표시한다', () => {
    location.segments = ['signup'];
    render(
      <AuthLayout>
        <main>본문</main>
      </AuthLayout>,
    );
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });

  it.each([[['login']], [['signup', 'complete']]])('%j 화면에는 뒤로가기가 없다', (segments) => {
    location.segments = segments;
    render(
      <AuthLayout>
        <main>본문</main>
      </AuthLayout>,
    );
    expect(screen.queryByRole('button', { name: '뒤로가기' })).not.toBeInTheDocument();
  });
});
