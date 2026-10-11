import { act, render, screen, within } from '@testing-library/react';
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
