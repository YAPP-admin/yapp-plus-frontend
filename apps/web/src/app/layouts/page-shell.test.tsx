import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { createAppQueryClient } from '@/app/providers';
import { HomePage } from '../../pages/home';
import { shell, shellWithNavigation } from './page-shell.css';
import { PageShell } from './page-shell';

vi.mock('@stackflow/react', () => ({
  useFlow: () => ({ push: vi.fn<(activityName: string, params: object) => void>() }),
}));
vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({
    tab,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { tab: string }) => (
    <a {...props} href={tab === 'home' ? '/' : `/${tab}`}>
      {children}
    </a>
  ),
}));
vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    activityName: _activityName,
    activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName?: string;
    activityParams: { noticeId: string };
  }) => (
    <a {...props} href={`/notices/${activityParams.noticeId}`}>
      {children}
    </a>
  ),
}));

describe('PageShell', () => {
  it('홈을 감쌀 때 헤더와 본문 영역을 중복 렌더링하지 않는다', () => {
    const client = createAppQueryClient();

    render(
      <QueryClientProvider client={client}>
        <PageShell>
          <HomePage />
        </PageShell>
      </QueryClientProvider>,
    );

    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toHaveTextContent('YAPP+');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: '홈' }),
    );
    expect(screen.getByRole('banner').parentElement).toHaveClass(shell);
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

  it('헤더를 숨긴 화면도 navigation을 별도 grid 행에 배치한다', () => {
    render(
      <PageShell header={null} navigation={<nav aria-label="주요 메뉴">메뉴</nav>}>
        <main>본문</main>
      </PageShell>,
    );

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.getByRole('main').parentElement).toHaveClass(shellWithNavigation);
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });
});
