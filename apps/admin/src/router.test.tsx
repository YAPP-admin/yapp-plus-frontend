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

  it.each(['/missing', '/login/missing', '/sessions/not-yet-available'])(
    '%s 직접 접근에 404와 복귀 링크를 제공한다',
    async (path) => {
      const router = await renderRoute(path);

      expect(
        await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요', level: 1 }),
      ).toBeVisible();
      expect(router.state.location.pathname).toBe(path);
      expect(screen.getByRole('link', { name: '대시보드로 이동' })).toHaveAttribute('href', '/');
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: '아이디' })).not.toBeInTheDocument();
    },
  );

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
    expect(filter).toHaveFocus();
  });
});
