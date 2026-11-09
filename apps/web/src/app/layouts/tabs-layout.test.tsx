/** 웹 탭 셸의 접근성 관계와 React Activity 수명을 검증합니다. */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabPanel, TabsLayout } from './tabs-layout';
import { PageShell } from './page-shell';
import { useEffect, useState, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

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

function PanelView({ active, children }: { active: 'home' | 'schedule'; children: ReactNode }) {
  return (
    <TabsLayout activeTab={active} onTabChange={vi.fn<() => void>()}>
      <TabPanel tab="home" active={active === 'home'}>
        {children}
      </TabPanel>
      <TabPanel tab="schedule" active={active === 'schedule'}>
        <main>일정</main>
      </TabPanel>
    </TabsLayout>
  );
}

describe('TabsLayout', () => {
  it.each([
    ['/', '홈', 'home'],
    ['/schedule', '일정', 'schedule'],
    ['/notices', '게시판', 'notices'],
    ['/my', 'MY', 'my'],
  ] as const)('%s에서 현재 메뉴 하나만 표시한다', (pathname, label, activeTab) => {
    render(
      <TabsLayout activeTab={activeTab} onTabChange={vi.fn<() => void>()}>
        <main>본문</main>
      </TabsLayout>,
    );
    const navigation = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
    expect(navigation.getAllByRole('tab')).toHaveLength(4);
    expect(navigation.getByRole('tab', { selected: true })).toHaveTextContent(label);
    expect(navigation.getByRole('tab', { selected: true })).toHaveAttribute('href', pathname);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('탭 경로가 바뀌어도 공통 메뉴 DOM을 유지하며 활성 표시를 갱신한다', () => {
    const { rerender } = render(
      <TabsLayout activeTab="home" onTabChange={vi.fn<() => void>()}>
        <main>홈</main>
      </TabsLayout>,
    );
    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });
    rerender(
      <TabsLayout activeTab="notices" onTabChange={vi.fn<() => void>()}>
        <main>공지</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBe(navigation);
    expect(within(navigation).getByRole('tab', { selected: true })).toHaveTextContent('게시판');
  });

  it('홈 탭에서는 상단 헤더에 YAPP 로고와 알림 링크를 렌더링한다', () => {
    render(
      <TabsLayout activeTab="home" onTabChange={vi.fn<() => void>()}>
        <main>홈</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('link', { name: 'YAPP 홈' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', '/alerts');
  });

  it('마이페이지 탭에서는 상단 헤더에 마이페이지 타이틀과 설정 링크를 렌더링한다', () => {
    render(
      <TabsLayout activeTab="my" onTabChange={vi.fn<() => void>()}>
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

  it('알림 화면에서는 선택된 탭 없이 일반 복귀 링크를 제공한다', () => {
    render(
      <TabsLayout activeTab={null}>
        <main>알림</main>
      </TabsLayout>,
    );
    const navigation = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
    expect(navigation.getAllByRole('link')).toHaveLength(4);
    expect(navigation.queryByRole('tablist')).not.toBeInTheDocument();
    expect(navigation.queryByRole('link', { current: 'page' })).not.toBeInTheDocument();
  });

  it('패널의 DOM·입력 상태를 보존하고 비활성 Effect를 정리한다', async () => {
    const start = vi.fn<() => void>();
    const stop = vi.fn<() => void>();
    const user = userEvent.setup();
    function HomeContent() {
      const [value, setValue] = useState('');
      useEffect(() => {
        start();
        return stop;
      }, []);
      return (
        <input
          aria-label="작성 중인 내용"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }
    const { rerender } = render(
      <PanelView active="home">
        <HomeContent />
      </PanelView>,
    );
    const input = screen.getByRole('textbox', { name: '작성 중인 내용' });
    await user.type(input, '보존할 내용');
    const homePanel = screen.getByRole('tabpanel', { name: '홈' });
    expect(screen.getByRole('tab', { name: '홈' })).toHaveAttribute('aria-controls', homePanel.id);
    expect(start).toHaveBeenCalledTimes(1);

    rerender(
      <PanelView active="schedule">
        <HomeContent />
      </PanelView>,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(homePanel).toHaveAttribute('inert');
    expect(stop).toHaveBeenCalledTimes(1);

    rerender(
      <PanelView active="home">
        <HomeContent />
      </PanelView>,
    );
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('보존할 내용');
    expect(start).toHaveBeenCalledTimes(2);
  });
});
