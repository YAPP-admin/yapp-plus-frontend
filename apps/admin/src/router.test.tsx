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
  it.each([
    ['/', '대시보드'],
    ['/sessions', '세션 관리'],
    ['/attendance', '출석부'],
    ['/members', '회원 관리'],
    ['/notices', '공지 목록'],
    ['/notices/notice-123', '공지 목록'],
    ['/attendance/session-1', '출석부'],
    ['/attendance/scores', '출석 총점'],
    ['/members/import', '회원 관리'],
    ['/notices/new', '공지 목록'],
    ['/notices/notice-123/edit', '공지 목록'],
    ['/notifications', '알림 발송 내역'],
  ])('%s에서 하나의 활성 관리 메뉴를 표시한다', async (path, label) => {
    await renderRoute(path);

    const menu = screen.getByRole('navigation', { name: '주요 메뉴' });
    const activeLinks = [
      ...within(menu).queryAllByRole('link', { current: 'page' }),
      ...within(menu).queryAllByRole('link', { current: 'location' }),
    ];
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]).toHaveAccessibleName(label);
    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /기수/ })).not.toBeInTheDocument();
  });

  it('대시보드 내용과 현재 메뉴, 키보드 탐색 순서를 유지한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');

    expect(await screen.findByRole('heading', { name: '대시보드', level: 1 })).toBeVisible();
    expect(screen.getByText('표시할 데이터가 없습니다')).toBeVisible();
    const menu = within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
      name: '대시보드',
      current: 'page',
    });
    expect(menu).toBeVisible();
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
    '/notices/notice-1/missing',
    '/notices/new/missing',
    '/notifications/missing',
    '/notices/notice-123/edit/missing',
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
    const menu = within(screen.getByRole('navigation', { name: '주요 메뉴' }));
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

describe('회원 목록 URL 상태', () => {
  it('복합 쿼리를 복원하고 탭과 필터 변경 시 다른 조건을 보존한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute(
      '/members?tab=pending&q=Kim&part=web&role=admin&status=active',
    );
    const input = await screen.findByRole('searchbox', { name: '이름 검색' });
    expect(input).toHaveValue('Kim');
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveValue('web');
    expect(screen.getByRole('combobox', { name: '권한' })).toHaveValue('admin');
    expect(screen.getByRole('combobox', { name: '상태' })).toHaveValue('active');
    expect(screen.getByRole('link', { name: '가입 대기' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '전체 회원' })).not.toHaveAttribute('aria-current');
    await user.click(screen.getByRole('link', { name: '전체 회원' }));
    await waitFor(() => expect(router.state.location.search).not.toHaveProperty('tab'));
    expect(router.state.location.search).toEqual({
      q: 'Kim',
      part: 'web',
      role: 'admin',
      status: 'active',
    });
    expect(screen.getByRole('link', { name: '전체 회원' })).toHaveAttribute('aria-current', 'page');
    await user.selectOptions(screen.getByRole('combobox', { name: '직군' }), 'ios');
    await waitFor(() => expect(router.state.location.search.part).toBe('ios'));
    expect(router.state.location.search).toMatchObject({
      q: 'Kim',
      role: 'admin',
      status: 'active',
    });
  });

  it.each(['/members', '/members?tab=bad&q=%5B%22Kim%22%5D&part=common&role=false&status=bad'])(
    '%s의 기본 상태를 표시한다',
    async (path) => {
      await renderRoute(path);
      expect(await screen.findByRole('searchbox')).toHaveValue('');
      for (const filter of screen.getAllByRole('combobox')) {
        expect(filter).toHaveValue('all');
      }
      expect(screen.getByRole('link', { name: '전체 회원' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    },
  );

  it('입력만으로는 URL을 바꾸지 않고 Enter 제출 시 q만 replace한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/members?part=web');
    const input = await screen.findByRole('searchbox');
    const length = router.history.length;

    await user.type(input, '김민수');
    expect(router.state.location.search).toEqual({ part: 'web' });

    await user.keyboard('{Enter}');
    await waitFor(() => expect(router.state.location.search).toEqual({ part: 'web', q: '김민수' }));
    expect(router.history.length).toBe(length);
  });

  it('검색 버튼으로 제출하고 빈 검색어 제출 시 q만 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/members?tab=pending&role=admin&q=old');

    await user.clear(await screen.findByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'Kim');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ tab: 'pending', role: 'admin', q: 'Kim' }),
    );

    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ tab: 'pending', role: 'admin' }),
    );
  });

  it('필터 변경과 history 이동에서는 미제출 입력 대신 URL 검색어를 복원한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/members?q=Kim');

    await user.type(await screen.findByRole('searchbox'), '미제출');
    await user.selectOptions(screen.getByRole('combobox', { name: '직군' }), 'web');
    await waitFor(() => expect(router.state.location.search.part).toBe('web'));
    expect(screen.getByRole('searchbox')).toHaveValue('Kim');

    await user.type(screen.getByRole('searchbox'), '미제출');
    act(() => router.history.back());
    await waitFor(() => expect(router.state.location.search).toEqual({ q: 'Kim' }));
    expect(screen.getByRole('searchbox')).toHaveValue('Kim');

    await user.type(screen.getByRole('searchbox'), '미제출');
    act(() => router.history.forward());
    await waitFor(() => expect(router.state.location.search.part).toBe('web'));
    expect(screen.getByRole('searchbox')).toHaveValue('Kim');
  });

  it('다른 검색 URL과 메뉴로 이동하면 미제출 입력을 버린다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/members?q=old');

    await user.type(await screen.findByRole('searchbox'), '미제출');
    await act(async () => router.navigate({ to: '/members', search: { q: 'new' } }));
    expect(screen.getByRole('searchbox')).toHaveValue('new');

    await user.type(screen.getByRole('searchbox'), '미제출');
    await user.click(screen.getByRole('link', { name: '세션 관리' }));
    await waitFor(() => expect(router.state.location.href).toBe('/sessions'));
    await user.click(screen.getByRole('link', { name: '회원 관리' }));
    expect(await screen.findByRole('searchbox')).toHaveValue('');
    expect(router.state.location.href).toBe('/members');
  });
});

describe('명단 업로드 진입점', () => {
  it('직접 접근하면 공통 메뉴와 업로드 안내만 표시한다', async () => {
    const router = await renderRoute('/members/import');

    expect(await screen.findByRole('heading', { name: '명단 업로드', level: 1 })).toBeVisible();
    expect(screen.getByRole('link', { name: '회원 관리' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '회원 목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/members',
    );
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '회원 목록 구분' })).not.toBeInTheDocument();
    expect(router.state.matches.some((match) => match.routeId === '/_dashboard/members/')).toBe(
      false,
    );
  });

  it('목록과 업로드의 명시적 이동은 필터를 초기화하고 뒤로가기는 이전 조건을 복원한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute(
      '/members?tab=pending&q=Kim&part=web&role=admin&status=active',
    );
    const initialSearch = router.state.location.search;

    await user.click(await screen.findByRole('link', { name: '명단 업로드' }));
    await waitFor(() => expect(router.state.location.href).toBe('/members/import'));

    act(() => router.history.back());
    expect(await screen.findByRole('searchbox')).toHaveValue('Kim');
    expect(router.state.location.search).toEqual(initialSearch);

    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '회원 목록으로 돌아가기' }));
    expect(await screen.findByRole('searchbox')).toHaveValue('');
    expect(router.state.location.href).toBe('/members');
  });

  it('키보드로 업로드 화면에 진입하고 목록에 복귀한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/members');

    for (let index = 0; index < 9; index += 1) {
      await user.tab();
    }
    expect(screen.getByRole('link', { name: '명단 업로드' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const backLink = await screen.findByRole('link', { name: '회원 목록으로 돌아가기' });

    // 화면 전환 후 포커스 시작점을 정하고 실제 Tab 순서로 복귀 링크에 접근한다.
    screen.getByRole('link', { name: 'YAPP+ Admin' }).focus();
    for (let index = 0; index < 8; index += 1) {
      await user.tab();
    }
    expect(backLink).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('searchbox')).toHaveValue('');
  });

  it('업로드 경로의 알 수 없는 하위 주소는 404를 표시한다', async () => {
    await renderRoute('/members/import/missing');

    expect(await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: '명단 업로드' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('공지 목록 URL 상태', () => {
  it.each([
    ['/notices', 'all'],
    ['/notices?category=all', 'all'],
    ['/notices?category=session', 'session'],
    ['/notices?category=submission', 'submission'],
    ['/notices?category=operation', 'operation'],
    ['/notices?category=unknown', 'all'],
    ['/notices?category=%5B%22session%22%5D', 'all'],
    ['/notices?category=true', 'all'],
  ])('%s에 직접 접근하면 %s를 선택한다', async (path, category) => {
    await renderRoute(path);

    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue(category);
    expect(screen.getByRole('heading', { name: '공지 목록', level: 1 })).toBeVisible();
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '회원 관리' })).not.toHaveAttribute('aria-current');
  });

  it('종류 변경을 history에 추가하고 복원하며 기본값은 URL에서 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices');
    const filter = await screen.findByRole('combobox', { name: '공지 종류' });

    await user.selectOptions(filter, 'session');
    await waitFor(() => expect(router.state.location.href).toBe('/notices?category=session'));
    await user.selectOptions(filter, 'submission');
    await waitFor(() => expect(router.state.location.href).toBe('/notices?category=submission'));

    act(() => router.history.back());
    await waitFor(() => expect(filter).toHaveValue('session'));
    act(() => router.history.forward());
    await waitFor(() => expect(filter).toHaveValue('submission'));

    await user.selectOptions(filter, 'all');
    await waitFor(() => expect(router.state.location.href).toBe('/notices'));
  });

  it('다른 메뉴로 이동하면 종류를 전달하지 않고 공지 재진입은 기본값을 사용한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=operation');

    await user.click(await screen.findByRole('link', { name: '회원 관리' }));
    await waitFor(() => expect(router.state.location.href).toBe('/members'));
    await user.click(screen.getByRole('link', { name: '공지 목록' }));

    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('all');
    expect(router.state.location.href).toBe('/notices');
  });

  it('키보드로 공지 메뉴에 진입하고 종류 필터에 접근한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');

    for (let index = 0; index < 7; index += 1) {
      await user.tab();
    }
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const filter = await screen.findByRole('combobox', { name: '공지 종류' });

    await user.tab();
    expect(screen.getByRole('link', { name: '알림 발송 내역' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: '공지 작성' })).toHaveFocus();
    await user.tab();
    expect(filter).toHaveFocus();
  });
});

describe('공지 상세 탐색', () => {
  it.each([
    ['', '읽음'],
    ['?tab=readers', '읽음'],
    ['?tab=questions', '질문'],
    ['?tab=unknown', '읽음'],
    ['?tab=%5B%22questions%22%5D', '읽음'],
  ])('직접 접근 %s에서 탭과 공지 ID를 복원한다', async (query, activeTab) => {
    await renderRoute(`/notices/notice-123${query}`);

    expect(await screen.findByRole('heading', { name: '공지 상세' })).toBeVisible();
    expect(screen.getByText('공지 ID: notice-123')).toBeVisible();
    expect(screen.getByRole('link', { name: activeTab })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '공지 목록' })).not.toBeInTheDocument();
  });

  it('탭 링크는 ID를 유지하고 history로 복원하며 읽음 기본값은 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices/notice-123');

    await user.click(await screen.findByRole('link', { name: '질문' }));
    await waitFor(() =>
      expect(router.state.location.href).toBe('/notices/notice-123?tab=questions'),
    );
    expect(screen.getByText('질문 목록을 준비 중입니다.')).toBeVisible();

    act(() => router.history.back());
    expect(await screen.findByText('읽음 현황을 준비 중입니다.')).toBeVisible();
    act(() => router.history.forward());
    expect(await screen.findByText('질문 목록을 준비 중입니다.')).toBeVisible();

    await user.click(screen.getByRole('link', { name: '읽음' }));
    await waitFor(() => expect(router.state.location.href).toBe('/notices/notice-123'));
  });

  it('typed 상세 진입 후 뒤로가기는 목록 필터를 복원하고 명시적 복귀는 초기화한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=session');

    await act(async () =>
      router.navigate({
        to: '/notices/$noticeId',
        params: { noticeId: 'notice-123' },
        search: { tab: 'questions' },
      }),
    );
    expect(await screen.findByText('공지 ID: notice-123')).toBeVisible();
    expect(router.state.location.href).toBe('/notices/notice-123?tab=questions');

    act(() => router.history.back());
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('session');
    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 목록으로 돌아가기' }));
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('all');
    expect(router.state.location.href).toBe('/notices');
  });

  it('키보드로 상세 탭을 전환하고 목록에 복귀한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/notices/notice-123');

    screen.getByRole('link', { name: '알림 발송 내역' }).focus();
    await user.tab();
    expect(screen.getByRole('link', { name: '공지 목록으로 돌아가기' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: '읽음' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: '질문' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('질문 목록을 준비 중입니다.')).toBeVisible();

    await user.tab({ shift: true });
    await user.tab({ shift: true });
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('all');
  });
});

describe('공지 작성·수정 진입점', () => {
  it.each([
    ['/notices/new', '공지 작성'],
    ['/notices/notice-123/edit', '공지 수정'],
  ])('%s 직접 접근은 독립된 %s 화면을 표시한다', async (path, heading) => {
    const router = await renderRoute(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '공지 상세 구분' })).not.toBeInTheDocument();
    expect(
      router.state.matches.some(
        (match) =>
          match.routeId === '/_dashboard/notices/' ||
          match.routeId === '/_dashboard/notices/$noticeId/',
      ),
    ).toBe(false);

    expect(screen.queryByText(/공지 ID:/)?.textContent ?? null).toBe(
      heading === '공지 작성' ? null : '공지 ID: notice-123',
    );
  });

  it('작성 진입은 필터를 제거하고 뒤로가기는 복원하며 명시적 복귀는 기본 목록으로 이동한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=submission');

    await user.click(await screen.findByRole('link', { name: '공지 작성' }));
    await waitFor(() => expect(router.state.location.href).toBe('/notices/new'));
    act(() => router.history.back());
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('submission');
    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 목록으로 돌아가기' }));
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('all');
    expect(router.state.location.href).toBe('/notices');
  });

  it('수정 진입은 ID만 유지하고 뒤로가기는 질문 탭을 복원하며 명시적 복귀는 읽음 탭으로 이동한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices/notice-123?tab=questions');

    await user.click(await screen.findByRole('link', { name: '공지 수정' }));
    await waitFor(() => expect(router.state.location.href).toBe('/notices/notice-123/edit'));
    act(() => router.history.back());
    expect(await screen.findByText('질문 목록을 준비 중입니다.')).toBeVisible();
    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 상세로 돌아가기' }));
    expect(await screen.findByText('읽음 현황을 준비 중입니다.')).toBeVisible();
    expect(router.state.location.href).toBe('/notices/notice-123');
  });

  it.each([
    ['/notices', '공지 작성', '공지 목록으로 돌아가기', '공지 목록'],
    ['/notices/notice-123', '공지 수정', '공지 상세로 돌아가기', '공지 상세'],
  ])('%s에서 키보드로 진입하고 복귀한다', async (path, entryName, returnName, heading) => {
    const user = userEvent.setup();
    await renderRoute(path);

    screen.getByRole('link', { name: entryName }).focus();
    await user.keyboard('{Enter}');
    const returnLink = await screen.findByRole('link', { name: returnName });
    screen.getByRole('link', { name: '알림 발송 내역' }).focus();
    await user.tab();
    expect(returnLink).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
  });
});

describe('알림 발송 내역 탐색', () => {
  it('직접 접근하면 알림 안내와 현재 메뉴를 표시한다', async () => {
    await renderRoute('/notifications');

    expect(await screen.findByRole('heading', { name: '알림 발송 내역' })).toBeVisible();
    expect(screen.getByText('알림 발송 내역을 준비 중입니다.')).toBeVisible();
    expect(screen.getByRole('link', { name: '알림 발송 내역' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: '공지 목록' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('메뉴 진입은 이전 쿼리를 제거하고 뒤로가기는 복원한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=operation');

    await user.click(await screen.findByRole('link', { name: '알림 발송 내역' }));
    await waitFor(() => expect(router.state.location.href).toBe('/notifications'));
    act(() => router.history.back());
    expect(await screen.findByRole('combobox', { name: '공지 종류' })).toHaveValue('operation');
    act(() => router.history.forward());
    expect(await screen.findByRole('heading', { name: '알림 발송 내역' })).toBeVisible();
  });

  it('키보드로 알림 메뉴에 진입한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');

    for (let index = 0; index < 8; index += 1) {
      await user.tab();
    }
    expect(screen.getByRole('link', { name: '알림 발송 내역' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: '알림 발송 내역' })).toBeVisible();
  });
});
