import type * as SeedDesign from '@seed-design/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Providers } from '~/providers';
import { getRouter } from '~/router';
import type * as RootRouteModule from '~/routes/__root';

const viewport = vi.hoisted(() => ({ narrow: true }));

vi.mock('@seed-design/react', async (importOriginal) => ({
  ...(await importOriginal<typeof SeedDesign>()),
  useBreakpointValue: () => viewport.narrow,
}));

vi.mock('~/routes/__root', async (importOriginal) => {
  const original = await importOriginal<typeof RootRouteModule>();

  Object.assign(original.Route.options, {
    shellComponent: ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>,
  });

  return original;
});

async function renderShell() {
  const router = getRouter();
  router.update({ history: createMemoryHistory({ initialEntries: ['/sessions'] }) });
  await router.load();
  const view = render(<RouterProvider router={router} />);

  return { router, ...view };
}

beforeEach(() => {
  viewport.narrow = true;
});

describe('좁은 화면 관리자 메뉴', () => {
  it.each(['Escape', '닫기 버튼'])(
    '%s로 닫으면 메뉴 버튼으로 포커스가 돌아온다',
    async (method) => {
      const user = userEvent.setup();
      await renderShell();
      const trigger = await screen.findByRole('button', { name: '메뉴' });

      // 초기 breakpoint가 base여도 사이드바 DOM을 유지한다. CSS 표시 여부는 Chrome에서 검증한다.
      expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();

      await user.click(trigger);
      const dialog = await screen.findByRole('dialog', { name: '관리자 메뉴' });

      expect(
        within(dialog).getByRole('link', { name: '세션 관리', current: 'page' }),
      ).toBeVisible();

      if (method === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        within(dialog).getByRole('button', { name: '메뉴 닫기' }).focus();

        await user.keyboard('{Enter}');
      }

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );

  it('키보드 포커스가 열린 메뉴 안에서 순환한다', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: '메뉴' }));
    const dialog = await screen.findByRole('dialog', { name: '관리자 메뉴' });

    await waitFor(() => expect(dialog).toHaveFocus());

    await user.tab();
    const close = within(dialog).getByRole('button', { name: '메뉴 닫기' });

    expect(close).toHaveFocus();

    await user.tab({ shift: true });

    expect(within(dialog).getByRole('link', { name: '알림 발송 내역' })).toHaveFocus();

    await user.tab();

    expect(close).toHaveFocus();
  });

  it('메뉴 선택 후 화면이 바뀌고 패널이 닫힌다', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: '메뉴' }));
    (await screen.findByRole('link', { name: '출석 총점' })).focus();

    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: '출석 총점', level: 1 })).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '메뉴' }));

    expect(await screen.findByRole('link', { name: '출석 총점', current: 'page' })).toBeVisible();
  });

  it('브라우저 뒤로 가기로 경로가 바뀌어도 열린 메뉴를 닫는다', async () => {
    const user = userEvent.setup();
    const { router } = await renderShell();

    await act(async () => router.navigate({ to: '/members' }));
    await user.click(await screen.findByRole('button', { name: '메뉴' }));

    expect(await screen.findByRole('dialog')).toBeVisible();

    act(() => router.history.back());

    expect(await screen.findByRole('heading', { name: '세션 관리' })).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('넓은 화면으로 전환하면 패널을 제거하고 사이드바를 표시한다', async () => {
    const user = userEvent.setup();
    const { router, rerender } = await renderShell();

    await user.click(await screen.findByRole('button', { name: '메뉴' }));

    expect(await screen.findByRole('dialog')).toBeVisible();

    viewport.narrow = false;
    rerender(<RouterProvider router={router} />);
    await act(async () => router.navigate({ to: '/members' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible();
    expect(screen.queryByRole('button', { name: '메뉴' })).not.toBeInTheDocument();
  });
});
