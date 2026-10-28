import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabsLayout } from './tabs-layout';
import { PageShell } from './page-shell';

const location = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => location.pathname }));

describe('TabsLayout', () => {
  it.each([
    ['/', '홈'],
    ['/schedule', '일정'],
    ['/notices', '게시판'],
    ['/my', 'MY'],
  ])('%s에서 현재 메뉴 하나만 표시한다', (pathname, label) => {
    location.pathname = pathname;
    render(
      <TabsLayout>
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
    location.pathname = '/';
    const { rerender } = render(
      <TabsLayout>
        <main>홈</main>
      </TabsLayout>,
    );
    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });
    location.pathname = '/notices';
    rerender(
      <TabsLayout>
        <main>공지</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBe(navigation);
    expect(within(navigation).getByRole('link', { current: 'page' })).toHaveTextContent('게시판');
  });

  it('홈 탭에서는 상단 헤더에 YAPP 로고와 알림 링크를 렌더링한다', () => {
    location.pathname = '/';
    render(
      <TabsLayout>
        <main>홈</main>
      </TabsLayout>,
    );
    expect(screen.getByRole('link', { name: 'YAPP 홈' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', '/notices');
  });

  it('마이페이지 탭에서는 상단 헤더에 마이페이지 타이틀과 설정 링크를 렌더링한다', () => {
    location.pathname = '/my';
    render(
      <TabsLayout>
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
