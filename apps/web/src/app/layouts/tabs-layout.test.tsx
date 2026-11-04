import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabsLayout } from './tabs-layout';
import { PageShell } from './page-shell';

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
    activityName,
    activityParams: _activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName: string;
    activityParams?: object;
  }) => (
    <a {...props} href={activityName === 'Alerts' ? '/alerts' : '/settings'}>
      {children}
    </a>
  ),
}));

describe('TabsLayout', () => {
  it.each([
    ['/', '홈', 'home'],
    ['/schedule', '일정', 'schedule'],
    ['/notices', '게시판', 'notices'],
    ['/my', 'MY', 'my'],
  ] as const)('%s에서 현재 메뉴 하나만 표시한다', (pathname, label, activeTab) => {
    render(
      <TabsLayout activeTab={activeTab}>
        <main>본문</main>
      </TabsLayout>,
    );
    const navigation = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
    expect(navigation.getAllByRole('link')).toHaveLength(4);
    expect(navigation.getByRole('link', { current: 'page' })).toHaveTextContent(label);
    expect(navigation.getByRole('link', { current: 'page' })).toHaveAttribute('href', pathname);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('탭 경로가 바뀌어도 공통 메뉴 DOM을 유지하며 활성 표시를 갱신한다', () => {
    const { rerender } = render(
      <TabsLayout activeTab="home">
        <main>홈</main>
      </TabsLayout>,
    );
    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });
    rerender(
      <TabsLayout activeTab="notices">
        <main>공지</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBe(navigation);
    expect(within(navigation).getByRole('link', { current: 'page' })).toHaveTextContent('게시판');
  });

  it('홈 탭에서는 상단 헤더에 YAPP 로고와 알림 링크를 렌더링한다', () => {
    render(
      <TabsLayout activeTab="home">
        <main>홈</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('link', { name: 'YAPP 홈' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', '/alerts');
  });

  it('마이페이지 탭에서는 상단 헤더에 마이페이지 타이틀과 설정 링크를 렌더링한다', () => {
    render(
      <TabsLayout activeTab="my">
        <main>마이</main>
      </TabsLayout>,
    );
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '설정' })).toHaveAttribute('href', '/settings');
  });

  it('상세·인증 화면에서 사용하는 기본 셸에는 주요 메뉴가 없다', () => {
    render(
      <PageShell>
        <main>상세</main>
      </PageShell>,
    );
    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();
  });
});
