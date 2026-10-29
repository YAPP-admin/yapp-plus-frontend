import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../pages/home';
import { PageShell } from './page-shell';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    replace: vi.fn<(url: string) => void>(),
  }),
  useSearchParams: () => ({
    get: vi.fn<(name: string) => string | null>().mockReturnValue(null),
  }),
}));

describe('PageShell', () => {
  it('홈을 감쌀 때 헤더와 본문 영역을 중복 렌더링하지 않는다', () => {
    render(
      <PageShell>
        <HomePage />
      </PageShell>,
    );

    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toHaveTextContent('YAPP+');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: '홈' }),
    );
  });

  it('plain 셸은 YAPP+ 문구 없이 헤더 영역과 본문을 하나씩만 렌더링한다', () => {
    render(
      <PageShell plain>
        <main>본문</main>
      </PageShell>,
    );

    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.queryByText('YAPP+')).not.toBeInTheDocument();
  });
});
