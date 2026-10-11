import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Providers } from './providers';
import { getRouter } from './router';
import type * as RootRouteModule from './routes/__root';

vi.mock('./routes/__root', async (importOriginal) => {
  const original = await importOriginal<typeof RootRouteModule>();

  // 실제 라우트 설정은 유지하고 테스트의 body 안에 html 문서가 중첩되는 것만 피한다.
  Object.assign(original.Route.options, {
    shellComponent: ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>,
  });

  return original;
});

async function renderRoute(path: string) {
  const router = getRouter();
  router.update({ history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe('관리자 라우팅', () => {
  it('대시보드 내용과 현재 메뉴, 키보드 탐색 순서를 유지한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');

    expect(await screen.findByRole('heading', { name: '대시보드', level: 1 })).toBeVisible();
    expect(screen.getByText('표시할 데이터가 없습니다')).toBeVisible();
    const menu = within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
      name: '대시보드',
    });
    expect(menu).toHaveAttribute('aria-current', 'page');
    await user.tab();
    expect(screen.getByRole('link', { name: 'YAPP+ Admin' })).toHaveFocus();
    await user.tab();
    expect(menu).toHaveFocus();
  });

  it('로그인에 직접 접근하면 관리자 셸 없이 로그인 폼을 표시한다', async () => {
    await renderRoute('/login');

    expect(await screen.findByRole('heading', { name: 'YAPP Admin' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: '아이디' })).toBeVisible();
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'YAPP+ Admin' })).not.toBeInTheDocument();
  });

  it.each([
    '/missing',
    '/login/missing',
    '/sessions/not-yet-available',
    '/attendance/session-1/missing',
    '/attendance/scores/missing',
  ])('%s 직접 접근에 404와 복귀 링크를 제공한다', async (path) => {
    const router = await renderRoute(path);

    expect(
      await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요', level: 1 }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe(path);
    expect(screen.getByRole('link', { name: '대시보드로 이동' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '아이디' })).not.toBeInTheDocument();
  });

  it('404의 복귀 링크를 키보드로 실행하면 대시보드로 이동한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/missing');
    const link = await screen.findByRole('link', { name: '대시보드로 이동' });

    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: '대시보드', level: 1 })).toBeVisible();
    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.queryByRole('heading', { name: '페이지를 찾을 수 없어요' }),
    ).not.toBeInTheDocument();
  });

  it('클라이언트 이동으로 로그인에 진입하면 대시보드 메뉴가 사라진다', async () => {
    const router = await renderRoute('/');

    await act(async () => router.navigate({ to: '/login' }));

    expect(await screen.findByRole('heading', { name: 'YAPP Admin' })).toBeVisible();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('세션 목록 탐색', () => {
  it.each([
    ['/sessions', 'all'],
    ['/sessions?part=common', 'common'],
    ['/sessions?part=web', 'web'],
    ['/sessions?part=unknown', 'all'],
    ['/sessions?part=%5B%22web%22%5D', 'all'],
    ['/sessions?part=true', 'all'],
  ])('%s에 직접 접근하면 %s를 선택한다', async (path, part) => {
    await renderRoute(path);
    expect(await screen.findByRole('combobox', { name: '직군' })).toHaveValue(part);
    expect(screen.getByRole('link', { name: '세션 관리' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '대시보드' })).not.toHaveAttribute('aria-current');
  });

  it('필터 변경을 history에 추가하고 기본값은 URL에서 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/sessions');
    const filter = await screen.findByRole('combobox', { name: '직군' });
    await user.selectOptions(filter, 'common');
    await waitFor(() => expect(router.state.location.searchStr).toBe('?part=common'));
    await user.selectOptions(filter, 'web');
    await waitFor(() => expect(router.state.location.searchStr).toBe('?part=web'));
    act(() => router.history.back());
    await waitFor(() => expect(filter).toHaveValue('common'));
    act(() => router.history.forward());
    await waitFor(() => expect(filter).toHaveValue('web'));
    await user.selectOptions(filter, 'all');
    await waitFor(() => expect(router.state.location.href).toBe('/sessions'));
  });

  it.each(['대시보드', 'YAPP+ Admin'])(
    '%s 이동 시 필터를 전달하지 않고 세션 재진입도 기본값을 사용한다',
    async (name) => {
      const user = userEvent.setup();
      const router = await renderRoute('/sessions?part=web');
      await user.click(await screen.findByRole('link', { name }));
      await waitFor(() => expect(router.state.location.href).toBe('/'));
      await user.click(screen.getByRole('link', { name: '세션 관리' }));
      expect(await screen.findByRole('combobox', { name: '직군' })).toHaveValue('all');
      expect(router.state.location.href).toBe('/sessions');
    },
  );

  it('메뉴에서 키보드로 세션 페이지에 진입하고 직군 필터에 도달한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('link', { name: '세션 관리' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const filter = await screen.findByRole('combobox', { name: '직군' });
    await user.tab();
    await user.tab();
    await user.tab();
    expect(filter).toHaveFocus();
  });
});

describe('출석 화면 탐색', () => {
  it.each([
    ['/attendance', '출석부', 'all'],
    ['/attendance?part=common', '출석부', 'common'],
    ['/attendance?part=unknown', '출석부', 'all'],
    ['/attendance/session-1?part=web', '세션별 출석부', 'web'],
    ['/attendance/session-1?part=common', '세션별 출석부', 'all'],
    ['/attendance/session-1?part=%5B%22web%22%5D', '세션별 출석부', 'all'],
    ['/attendance/scores?part=ios', '출석 총점', 'ios'],
    ['/attendance/scores?part=common', '출석 총점', 'all'],
    ['/attendance/scores?part=true', '출석 총점', 'all'],
  ])('%s의 제목과 필터를 복원한다', async (path, heading, part) => {
    await renderRoute(path);
    expect(await screen.findByRole('heading', { name: heading, level: 1 })).toBeVisible();
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveValue(part);
    const menu = within(screen.getByRole('navigation'));
    expect(menu.getByRole('link', { name: '세션 관리' })).not.toHaveAttribute('aria-current');
    const activeMenu = heading === '출석 총점' ? '출석 총점' : '출석부';
    expect(menu.getByRole('link', { name: activeMenu })).toHaveAttribute('aria-current');
    expect(
      menu.getByRole('link', {
        name: activeMenu === '출석부' ? '출석 총점' : '출석부',
      }),
    ).not.toHaveAttribute('aria-current');
  });

  it('scores는 세션 ID로 처리하지 않고 총점 경로를 우선한다', async () => {
    const router = await renderRoute('/attendance/scores');
    expect(await screen.findByRole('heading', { name: '출석 총점' })).toBeVisible();
    expect(
      router.state.matches.some((match) => match.routeId === '/_dashboard/attendance/$sessionId'),
    ).toBe(false);
    expect(screen.queryByText(/세션 ID:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '전체 직군 대상' })).not.toBeInTheDocument();
  });

  it.each(['/attendance', '/attendance/session-1', '/attendance/scores'])(
    '%s에서 필터를 history로 복원하고 기본값은 생략한다',
    async (path) => {
      const user = userEvent.setup();
      const router = await renderRoute(path);
      const filter = await screen.findByRole('combobox', { name: '직군' });
      await user.selectOptions(filter, 'web');
      await waitFor(() => expect(router.state.location.searchStr).toBe('?part=web'));
      await user.selectOptions(filter, 'ios');
      await waitFor(() => expect(router.state.location.searchStr).toBe('?part=ios'));
      act(() => router.history.back());
      await waitFor(() => expect(filter).toHaveValue('web'));
      act(() => router.history.forward());
      await waitFor(() => expect(filter).toHaveValue('ios'));
      await user.selectOptions(filter, 'all');
      await waitFor(() => expect(router.state.location.searchStr).toBe(''));
    },
  );

  it('typed 세션 탐색과 목록 복귀는 선택 경로를 사용하고 필터를 초기화한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/attendance?part=common');
    await act(async () =>
      router.navigate({
        to: '/attendance/$sessionId',
        params: { sessionId: 'session-123' },
        search: { part: 'web' },
      }),
    );
    expect(await screen.findByText('세션 ID: session-123')).toBeVisible();
    expect(router.state.location.href).toBe('/attendance/session-123?part=web');
    expect(screen.queryByRole('option', { name: '전체 직군 대상' })).not.toBeInTheDocument();
    const backLink = screen.getByRole('link', { name: '세션 목록으로 돌아가기' });
    expect(backLink).toHaveAttribute('href', '/attendance');
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(backLink).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(router.state.location.href).toBe('/attendance'));
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveValue('all');
    act(() => router.history.back());
    expect(await screen.findByText('세션 ID: session-123')).toBeVisible();
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveValue('web');
  });

  it('각 메뉴는 자신의 기본 경로로 이동하고 이전 필터를 전달하지 않는다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/sessions?part=common');
    await user.click(await screen.findByRole('link', { name: '출석부' }));
    await waitFor(() => expect(router.state.location.href).toBe('/attendance'));
    await user.selectOptions(screen.getByRole('combobox'), 'common');
    await user.click(screen.getByRole('link', { name: '출석 총점' }));
    await waitFor(() => expect(router.state.location.href).toBe('/attendance/scores'));
    expect(screen.getByRole('combobox')).toHaveValue('all');
    await user.selectOptions(screen.getByRole('combobox'), 'web');
    await user.click(screen.getByRole('link', { name: '세션 관리' }));
    await waitFor(() => expect(router.state.location.href).toBe('/sessions'));
    expect(screen.getByRole('combobox')).toHaveValue('all');
  });
});
