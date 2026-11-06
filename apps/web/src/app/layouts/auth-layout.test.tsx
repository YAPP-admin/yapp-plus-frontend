import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthLayout } from './auth-layout';

vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isRoot: true }),
  useFlow: () => ({
    pop: vi.fn<() => void>(),
    replace: vi.fn<(activityName: string, params: object) => void>(),
  }),
}));

describe('AuthLayout', () => {
  it('showBack이 설정된 화면에 뒤로가기를 표시한다', () => {
    render(
      <AuthLayout showBack>
        <main>본문</main>
      </AuthLayout>,
    );
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
  });

  it('기본 화면에는 뒤로가기가 없다', () => {
    render(
      <AuthLayout>
        <main>본문</main>
      </AuthLayout>,
    );
    expect(screen.queryByRole('button', { name: '뒤로가기' })).not.toBeInTheDocument();
  });
});
