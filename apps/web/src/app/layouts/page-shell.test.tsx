import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../pages/home';
import { shell } from './page-shell.css';
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
});
