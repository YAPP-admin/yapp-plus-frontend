import type * as SeedDesign from '@seed-design/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBrowserHistory, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Providers } from './providers';
import { getRouter } from './router';
import type * as RootRouteModule from './routes/__root';

// 기존 라우팅 회귀는 데스크톱 레이아웃에서 검증합니다.
vi.mock('@seed-design/react', async (importOriginal) => ({
  ...(await importOriginal<typeof SeedDesign>()),
  useBreakpointValue: () => false,
}));

vi.mock('./routes/__root', async (importOriginal) => {
  const original = await importOriginal<typeof RootRouteModule>();

  // 실제 라우트 설정은 유지하고 테스트의 body 안에 html 문서가 중첩되는 것만 피한다.
  Object.assign(original.Route.options, {
    shellComponent: ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>,
  });

  return original;
});

async function renderRoute(
  path: string,
  history = createMemoryHistory({ initialEntries: [path] }),
) {
  const router = getRouter();
  router.update({ history });
  await router.load();
  render(<RouterProvider router={router} />);

  return router;
}

describe('관리자 라우팅', () => {
  it.each([
    ['/', '대시보드', '대시보드'],
    ['/sessions', '세션 관리', '세션 목록'],
    ['/attendance', '출석부', '출석부'],
    ['/members', '회원 관리', '회원 관리'],
    ['/notices', '공지 목록', '공지 목록'],
    ['/notices/notice-123', '공지 목록', '공지 상세'],
    ['/attendance/session-1', '출석부', '세션별 출석부'],
    ['/attendance/scores', '출석 총점', '출석 총점'],
    ['/members/import', '회원 관리', '명단 업로드'],
    ['/notices/new', '공지 목록', '공지 작성'],
    ['/notices/notice-123/edit', '공지 목록', '공지 수정'],
    ['/notifications', '알림 발송 내역', '알림 발송 내역'],
  ])('%s에서 현재 위치와 하나의 활성 관리 메뉴를 표시한다', async (path, label, currentPage) => {
    await renderRoute(path);

    const location = await screen.findByRole('navigation', { name: '현재 위치' });

    expect(within(location).getByText(currentPage)).toBeVisible();

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
    ['/sessions', '전체'],
    ['/sessions?type=offline', '오프라인'],
    ['/sessions?type=team', '팀 세션'],
    ['/sessions?type=unknown', '전체'],
    ['/sessions?type=%5B%22team%22%5D', '전체'],
    ['/sessions?type=true', '전체'],
    ['/sessions?part=web', '전체'],
    ['/sessions?type=offline&part=web', '오프라인'],
  ])('%s에 직접 접근하면 %s를 선택한다', async (path, label) => {
    await renderRoute(path);

    expect(await screen.findByRole('radio', { name: label })).toBeChecked();
    expect(screen.getByRole('link', { name: '세션 관리' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '대시보드' })).not.toHaveAttribute('aria-current');
  });

  it('필터 변경을 history에 추가하고 기본값은 URL에서 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/sessions?part=web');

    await user.click(await screen.findByRole('radio', { name: '오프라인' }));

    await waitFor(() => expect(router.state.location.searchStr).toBe('?type=offline'));

    await user.click(screen.getByRole('radio', { name: '팀 세션' }));

    await waitFor(() => expect(router.state.location.searchStr).toBe('?type=team'));

    act(() => router.history.back());

    await waitFor(() => expect(screen.getByRole('radio', { name: '오프라인' })).toBeChecked());

    act(() => router.history.forward());

    await waitFor(() => expect(screen.getByRole('radio', { name: '팀 세션' })).toBeChecked());

    await user.click(screen.getByRole('radio', { name: '전체' }));

    await waitFor(() => expect(router.state.location.href).toBe('/sessions'));
  });

  it.each(['대시보드', 'YAPP+ Admin'])(
    '%s 이동 시 필터를 전달하지 않고 세션 재진입도 기본값을 사용한다',
    async (name) => {
      const user = userEvent.setup();
      const router = await renderRoute('/sessions?type=team');

      await user.click(await screen.findByRole('link', { name }));

      await waitFor(() => expect(router.state.location.href).toBe('/'));

      await user.click(screen.getByRole('link', { name: '세션 관리' }));

      expect(await screen.findByRole('radio', { name: '전체' })).toBeChecked();
      expect(router.state.location.href).toBe('/sessions');
    },
  );

  it('메뉴에서 키보드로 세션 페이지에 진입하고 유형 필터를 선택한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/');

    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.getByRole('link', { name: '세션 관리' })).toHaveFocus();

    await user.keyboard('{Enter}');
    const filter = await screen.findByRole('radio', { name: '전체' });

    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    expect(filter).toHaveFocus();

    await user.keyboard('{ArrowRight}');

    await waitFor(() => expect(screen.getByRole('radio', { name: '오프라인' })).toBeChecked());
  });
});

describe('출석 화면 탐색', () => {
  it.each([
    ['/attendance', '출석부', '모든 세션'],
    ['/attendance?part=common', '출석부', '전체 직군 대상'],
    ['/attendance?part=unknown', '출석부', '모든 세션'],
    ['/attendance/session-1?part=web', '세션별 출석부', 'Web'],
    ['/attendance/session-1?part=common', '세션별 출석부', '모든 직군'],
    ['/attendance/session-1?part=%5B%22web%22%5D', '세션별 출석부', '모든 직군'],
    ['/attendance/scores?part=ios', '출석 총점', 'iOS'],
    ['/attendance/scores?part=common', '출석 총점', '모든 직군'],
    ['/attendance/scores?part=true', '출석 총점', '모든 직군'],
  ])('%s의 제목과 필터를 복원한다', async (path, heading, part) => {
    await renderRoute(path);

    expect(await screen.findByRole('heading', { name: heading, level: 1 })).toBeVisible();
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveTextContent(part);

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
  });

  it.each(['/attendance', '/attendance/session-1', '/attendance/scores'])(
    '%s에서 필터를 history로 복원하고 기본값은 생략한다',
    async (path) => {
      const user = userEvent.setup();
      const router = await renderRoute(path);
      const filter = await screen.findByRole('combobox', { name: '직군' });

      await user.click(filter);
      await user.click(await screen.findByRole('option', { name: 'Web' }));

      await waitFor(() => expect(router.state.location.searchStr).toBe('?part=web'));

      await user.click(filter);
      await user.click(await screen.findByRole('option', { name: 'iOS' }));

      await waitFor(() => expect(router.state.location.searchStr).toBe('?part=ios'));

      act(() => router.history.back());

      await waitFor(() => expect(filter).toHaveTextContent('Web'));

      act(() => router.history.forward());

      await waitFor(() => expect(filter).toHaveTextContent('iOS'));

      await user.click(filter);
      await user.click(
        await screen.findByRole('option', {
          name: path === '/attendance' ? '모든 세션' : '모든 직군',
        }),
      );

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
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveTextContent(/모든 세션/);

    act(() => router.history.back());

    expect(await screen.findByText('세션 ID: session-123')).toBeVisible();
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveTextContent('Web');
  });

  it('각 메뉴는 자신의 기본 경로로 이동하고 이전 필터를 전달하지 않는다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/sessions?part=common');

    await user.click(await screen.findByRole('link', { name: '출석부' }));

    await waitFor(() => expect(router.state.location.href).toBe('/attendance'));

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '전체 직군 대상' }));
    await user.click(screen.getByRole('link', { name: '출석 총점' }));

    await waitFor(() => expect(router.state.location.href).toBe('/attendance/scores'));
    expect(screen.getByRole('combobox')).toHaveTextContent(/모든 직군/);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Web' }));
    await user.click(screen.getByRole('link', { name: '세션 관리' }));

    await waitFor(() => expect(router.state.location.href).toBe('/sessions'));
    expect(screen.getByRole('radio', { name: '전체' })).toBeChecked();
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
    expect(screen.getByRole('combobox', { name: '직군' })).toHaveTextContent('Web');
    expect(screen.getByRole('combobox', { name: '권한' })).toHaveTextContent('운영진');
    expect(screen.getByRole('combobox', { name: '상태' })).toHaveTextContent('활성');
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

    await user.click(screen.getByRole('combobox', { name: '직군' }));
    await user.click(await screen.findByRole('option', { name: 'iOS' }));

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
        expect(filter).toHaveTextContent(/모든 (직군|권한|상태)/);
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
    await user.click(screen.getByRole('combobox', { name: '직군' }));
    await user.click(await screen.findByRole('option', { name: 'Web' }));

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
    ['/notices', '전체'],
    ['/notices?category=all', '전체'],
    ['/notices?category=session', '세션'],
    ['/notices?category=submission', '제출'],
    ['/notices?category=operation', '운영'],
    ['/notices?category=unknown', '전체'],
    ['/notices?category=%5B%22session%22%5D', '전체'],
    ['/notices?category=true', '전체'],
  ])('%s에 직접 접근하면 %s를 선택한다', async (path, category) => {
    await renderRoute(path);

    expect(await screen.findByRole('radio', { name: category })).toBeChecked();
    expect(screen.getByRole('heading', { name: '공지 목록', level: 1 })).toBeVisible();
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '회원 관리' })).not.toHaveAttribute('aria-current');
  });

  it('종류 변경을 history에 추가하고 복원하며 기본값은 URL에서 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices');
    await screen.findByRole('radio', { name: '전체' });

    await user.click(await screen.findByRole('radio', { name: '세션' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices?category=session'));

    await user.click(await screen.findByRole('radio', { name: '제출' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices?category=submission'));

    act(() => router.history.back());

    await waitFor(() => expect(screen.getByRole('radio', { name: '세션' })).toBeChecked());

    act(() => router.history.forward());

    await waitFor(() => expect(screen.getByRole('radio', { name: '제출' })).toBeChecked());

    await user.click(await screen.findByRole('radio', { name: '전체' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices'));
  });

  it('다른 메뉴로 이동하면 종류를 전달하지 않고 공지 재진입은 기본값을 사용한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=operation');

    await user.click(await screen.findByRole('link', { name: '회원 관리' }));

    await waitFor(() => expect(router.state.location.href).toBe('/members'));

    await user.click(screen.getByRole('link', { name: '공지 목록' }));

    expect(await screen.findByRole('radio', { name: '전체' })).toBeChecked();
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
    const filter = await screen.findByRole('radio', { name: '전체' });

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
    await renderRoute(`/notices/demo-session${query}`);

    expect(await screen.findByRole('heading', { name: '공지 상세' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: '예시 세션 안내' })).toBeVisible();
    expect(screen.getByRole('link', { name: activeTab })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '공지 목록' })).not.toBeInTheDocument();
  });

  it('탭 링크는 ID를 유지하고 history로 복원하며 읽음 기본값은 생략한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices/demo-session');

    await user.click(await screen.findByRole('link', { name: '질문' }));
    await waitFor(() =>
      expect(router.state.location.href).toBe('/notices/demo-session?tab=questions'),
    );

    expect(screen.getByText('질문 목록을 준비 중입니다.')).toBeVisible();

    act(() => router.history.back());

    expect(await screen.findByRole('table')).toBeVisible();

    act(() => router.history.forward());

    expect(await screen.findByText('질문 목록을 준비 중입니다.')).toBeVisible();

    await user.click(screen.getByRole('link', { name: '읽음' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices/demo-session'));
  });

  it('typed 상세 진입 후 뒤로가기는 목록 필터를 복원하고 명시적 복귀는 초기화한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=session');

    await act(async () =>
      router.navigate({
        to: '/notices/$noticeId',
        params: { noticeId: 'demo-session' },
        search: { tab: 'questions' },
      }),
    );

    expect(await screen.findByRole('heading', { name: '예시 세션 안내' })).toBeVisible();
    expect(router.state.location.href).toBe('/notices/demo-session?tab=questions');

    act(() => router.history.back());

    expect(await screen.findByRole('radio', { name: '세션' })).toBeChecked();

    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 목록으로 돌아가기' }));

    expect(await screen.findByRole('radio', { name: '전체' })).toBeChecked();
    expect(router.state.location.href).toBe('/notices');
  });

  it('키보드로 상세 탭을 전환하고 목록에 복귀한다', async () => {
    const user = userEvent.setup();
    await renderRoute('/notices/demo-session');

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

    expect(await screen.findByRole('radio', { name: '전체' })).toBeChecked();
  });
});

describe('공지 작성·수정 진입점', () => {
  it.each([
    ['/notices/new', '공지 작성'],
    ['/notices/demo-session/edit', '공지 수정'],
  ])('%s 직접 접근은 독립된 %s 화면을 표시한다', async (path, heading) => {
    const router = await renderRoute(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByRole('link', { name: '공지 목록' })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByRole('radiogroup', { name: '공지 종류' })).toBeVisible();
    expect(screen.queryByRole('navigation', { name: '공지 상세 구분' })).not.toBeInTheDocument();
    expect(
      router.state.matches.some(
        (match) =>
          match.routeId === '/_dashboard/notices/' ||
          match.routeId === '/_dashboard/notices/$noticeId/',
      ),
    ).toBe(false);
  });

  it('작성 진입은 필터를 제거하고 뒤로가기는 복원하며 명시적 복귀는 기본 목록으로 이동한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices?category=submission');

    await user.click(await screen.findByRole('link', { name: '공지 작성' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices/new'));

    act(() => router.history.back());

    await waitFor(() => expect(screen.getByRole('radio', { name: '제출' })).toBeChecked());

    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 목록으로 돌아가기' }));

    expect(await screen.findByRole('radio', { name: '전체' })).toBeChecked();
    expect(router.state.location.href).toBe('/notices');
  });

  it('수정 진입은 ID만 유지하고 뒤로가기는 질문 탭을 복원하며 명시적 복귀는 읽음 탭으로 이동한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices/demo-session?tab=questions');

    await user.click(await screen.findByRole('link', { name: '공지 수정' }));

    await waitFor(() => expect(router.state.location.href).toBe('/notices/demo-session/edit'));

    act(() => router.history.back());

    expect(await screen.findByText('질문 목록을 준비 중입니다.')).toBeVisible();

    act(() => router.history.forward());
    await user.click(await screen.findByRole('link', { name: '공지 상세로 돌아가기' }));

    expect(await screen.findByRole('table')).toBeVisible();
    expect(router.state.location.href).toBe('/notices/demo-session');
  });

  it.each([
    ['/notices', '공지 작성', '공지 목록으로 돌아가기', '공지 목록'],
    ['/notices/demo-session', '공지 수정', '공지 상세로 돌아가기', '공지 상세'],
  ])('%s에서 키보드로 진입하고 복귀한다', async (path, entryName, returnName, heading) => {
    const user = userEvent.setup();
    await renderRoute(path);

    (await screen.findByRole('link', { name: entryName })).focus();

    await user.keyboard('{Enter}');
    const returnLink = await screen.findByRole('link', { name: returnName });
    screen.getByRole('link', { name: '알림 발송 내역' }).focus();

    for (let step = 0; step < 40 && document.activeElement !== returnLink; step += 1) {
      await user.tab();
    }

    expect(returnLink).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
  });
});

describe('공지 미저장 이탈', () => {
  it('앱 이동·뒤로가기를 취소하면 초안을 유지하고 확정하면 이전 필터로 돌아간다', async () => {
    const user = userEvent.setup();
    const originalUrl = window.location.href;
    window.history.replaceState(null, '', '/notices?category=submission');
    const history = createBrowserHistory();
    try {
      const router = await renderRoute('/notices?category=submission', history);
      await user.click(await screen.findByRole('link', { name: '공지 작성' }));
      const title = await screen.findByRole('textbox', { name: '제목' });
      await user.type(title, '작성 중인 제목');
      const menuLink = screen.getByRole('link', { name: '알림 발송 내역' });

      await user.click(menuLink);
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', { name: '계속 작성' }),
      );
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(title).toHaveValue('작성 중인 제목');
      expect(router.state.location.pathname).toBe('/notices/new');
      await waitFor(() => expect(menuLink).toHaveFocus());

      act(() => router.history.back());
      await screen.findByRole('alertdialog');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(title).toHaveValue('작성 중인 제목');

      act(() => router.history.back());
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', { name: '나가기' }),
      );
      await waitFor(() => expect(router.state.location.href).toBe('/notices?category=submission'));
      expect(await screen.findByRole('radio', { name: '제출' })).toBeChecked();

      act(() => router.history.forward());
      expect(await screen.findByRole('textbox', { name: '제목' })).toHaveValue('');
    } finally {
      history.destroy();
      window.history.replaceState(null, '', originalUrl);
    }
  });

  it('본문·첨부만 바꿔도 확인하고 원상 복구하면 바로 이동하며 저장 원본은 보존한다', async () => {
    const user = userEvent.setup();
    const router = await renderRoute('/notices/demo-session/edit');
    const title = await screen.findByRole('textbox', { name: '제목' });
    await user.type(title, ' 수정');
    await user.clear(title);
    await user.type(title, '  예시 세션 안내  ');
    const body = await screen.findByRole('textbox', { name: '공지 내용' });
    const paragraph = within(body).getAllByRole('paragraph')[0];
    if (!paragraph) {
      throw new Error('본문 문단이 없습니다.');
    }
    const originalBody = paragraph.textContent;
    paragraph.textContent = '본문만 변경';
    await waitFor(() => expect(body).toHaveTextContent('본문만 변경'));

    await user.click(screen.getByRole('link', { name: '공지 상세로 돌아가기' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: '계속 작성' }),
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(body).toHaveTextContent('본문만 변경');
    paragraph.textContent = originalBody;
    await waitFor(() => expect(body).toHaveTextContent(originalBody ?? ''));

    await user.click(screen.getByRole('link', { name: '공지 상세로 돌아가기' }));
    expect(await screen.findByRole('heading', { name: '공지 상세' })).toBeVisible();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(await screen.findByRole('link', { name: '공지 수정' }));
    await user.click(await screen.findByRole('button', { name: '세션 안내.PNG 제거' }));
    await user.click(screen.getByRole('link', { name: '공지 상세로 돌아가기' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: '나가기' }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/notices/demo-session'));
    expect(await screen.findByRole('img', { name: '세션 안내.PNG' })).toBeVisible();
    expect(screen.getByRole('document', { name: '공지 본문' })).toHaveTextContent(
      originalBody ?? '',
    );
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

    expect(await screen.findByRole('radio', { name: '운영' })).toBeChecked();

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

describe('세션 관리 목록', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('실제 모의 저장소의 세션을 최신순으로 표시하고 유형별 개수를 갱신한다', async () => {
    vi.stubEnv('SSR', false);
    const user = userEvent.setup();
    await renderRoute('/sessions');

    const list = await screen.findByRole('list', { name: '세션 목록' });
    const cards = within(list).getAllByRole('heading');

    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAccessibleName('개발용 팀 세션');
    expect(cards[1]).toHaveAccessibleName('개발용 오프라인 세션');
    expect(screen.getByRole('status')).toHaveTextContent('전체 2개');

    await user.click(screen.getByRole('radio', { name: '오프라인' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('오프라인 1개'));
    expect(within(list).getByRole('heading', { name: '개발용 오프라인 세션' })).toBeVisible();
    expect(within(list).queryByRole('heading', { name: '개발용 팀 세션' })).not.toBeInTheDocument();
  });

  it('카드 본문을 눌러도 세션 관리 화면과 필터를 유지한다', async () => {
    vi.stubEnv('SSR', false);
    const user = userEvent.setup();
    const router = await renderRoute('/sessions?type=team');
    const title = await screen.findByRole('heading', { name: '개발용 팀 세션' });

    await user.click(title);

    expect(router.state.location.href).toBe('/sessions?type=team');
    expect(screen.getByRole('status')).toHaveTextContent('팀 세션 1개');
    expect(screen.getByRole('radio', { name: '팀 세션' })).toBeChecked();
    expect(within(screen.getByRole('article')).queryByRole('link')).not.toBeInTheDocument();
  });
});
