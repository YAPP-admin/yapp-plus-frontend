import { SnackbarProvider } from '@yapp-plus/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStackflowApp, stackflowConfig } from './stack';

const popstateListeners: EventListenerOrEventListenerObject[] = [];
const addWindowListener = window.addEventListener.bind(window);

beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  // 각 테스트의 새 문서에서 생성한 history 구독을 수거합니다.
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'popstate' && listener) {
      popstateListeners.push(listener);
    }
    addWindowListener(type, listener, options);
  });
  window.history.replaceState({}, '', '/');
});

afterEach(async () => {
  if (
    'happyDOM' in window &&
    window.happyDOM instanceof Object &&
    'abort' in window.happyDOM &&
    typeof window.happyDOM.abort === 'function'
  ) {
    await window.happyDOM.abort();
  }
  for (const listener of popstateListeners.splice(0)) {
    window.removeEventListener('popstate', listener);
  }
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.history.replaceState({}, '', '/');
});

function renderStack() {
  const { Stack, actions } = createStackflowApp();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <Suspense fallback={<div>로딩 중…</div>}>
          <Stack />
        </Suspense>
      </SnackbarProvider>
    </QueryClientProvider>,
  );
  return { ...view, actions };
}

async function waitForTopHeading(name: string | RegExp) {
  let element: HTMLElement | null = null;
  await waitFor(
    () => {
      element =
        [
          ...document.querySelectorAll<HTMLElement>('[data-stackflow-component-name="AppScreen"]'),
        ].find((candidate) => {
          // 화면 제목은 전환 중에도 보입니다. 실제로 조작 가능한 시점까지 기다립니다.
          const interaction = candidate.closest('[data-global-transition-state]');
          if (
            interaction &&
            interaction.getAttribute('data-global-transition-state') !== 'enter-done'
          ) {
            return false;
          }
          const heading =
            [...candidate.querySelectorAll<HTMLHeadingElement>('h1')].find(isVisible) ?? null;
          const matches =
            typeof name === 'string'
              ? heading?.textContent === name
              : name.test(heading?.textContent ?? '');
          return matches;
        }) ?? null;
      expect(element).toBeInTheDocument();
    },
    { timeout: 10000 },
  );

  if (!element) {
    throw new Error(`최상단 Activity(${String(name)})를 찾지 못했습니다.`);
  }

  return within(element);
}

function isVisible(element: HTMLElement) {
  let current: HTMLElement | null = element;

  while (current) {
    if (current.hidden || window.getComputedStyle(current).display === 'none') {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

describe('Stackflow FSD 화면 연결', () => {
  it('이전 Tabs를 종료한 뒤에도 현재 화면의 탭과 URL을 변경한다', async () => {
    const user = userEvent.setup();
    const { actions } = renderStack();
    await waitForTopHeading('홈');
    await act(() => actions.replace('Login', {}, { animate: false }));
    await waitForTopHeading(/당신의 작은 아이디어가/);
    await act(() => actions.replace('Tabs', { initialTab: 'home' }, { animate: false }));
    const currentScreen = await waitForTopHeading('홈');
    const historyLength = window.history.length;

    for (const [label, path, title] of [
      ['일정', '/schedule', '일정'],
      ['게시판', '/notices', '게시판'],
      ['MY', '/my', '마이페이지'],
      ['홈', '/', '홈'],
    ]) {
      await user.click(currentScreen.getByRole('link', { name: label }));
      await waitFor(() => expect(window.location.pathname).toBe(path));
      await waitFor(() => expect(document.title).toBe(`${title} | YAPP+`));
      expect(currentScreen.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
    expect(window.history.length).toBe(historyLength);
  }, 15000);

  it('web에서는 화면별 prop을 생략해도 swipe edge를 렌더링하지 않는다', async () => {
    window.history.replaceState({}, '', '/alerts');
    renderStack();

    expect(await waitForTopHeading('알림')).toBeTruthy();
    expect(document.querySelector('[data-part="edge"]')).not.toBeInTheDocument();
  }, 15000);

  it('탭 전환은 history를 늘리지 않고 실행 중인 탭 상태를 보존한다', async () => {
    const user = userEvent.setup();
    renderStack();

    const homeScreen = await waitForTopHeading('홈');
    await user.click(homeScreen.getByRole('button', { name: '팀 세션 화면으로 전환' }));
    const historyLength = window.history.length;

    await user.click(screen.getByRole('link', { name: /^일정$/ }));
    await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
    expect(await waitForTopHeading('일정')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: /^홈$/ }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    const restoredHome = await waitForTopHeading('홈');
    expect(restoredHome.getByRole('heading', { name: '이번 주는 팀 세션이에요' })).toBeVisible();
    expect(window.history.length).toBe(historyLength);
  }, 15000);

  it('공지 목록에서 상세로 이동하고 browser back으로 필터 상태를 복원한다', async () => {
    const user = userEvent.setup();
    renderStack();

    const homeScreen = await waitForTopHeading('홈');
    await user.click(homeScreen.getByRole('link', { name: /^게시판$/ }));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    const noticesScreen = await waitForTopHeading('게시판');
    await user.click(noticesScreen.getByRole('tab', { name: '과제' }));
    await waitFor(() => expect(window.location.search).toBe('?category=ASSIGNMENT'));
    await user.click(
      noticesScreen.getByRole('link', { name: /과제 공지: 사용자 테스트 결과 제출/ }),
    );

    await waitFor(() => expect(window.location.pathname).toBe('/notices/2'));
    expect(await waitForTopHeading('사용자 테스트 결과 제출')).toBeTruthy();
    window.history.back();

    const restored = await waitForTopHeading('게시판');
    expect(restored.getByRole('tab', { name: '과제' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('?category=ASSIGNMENT');
    window.history.forward();
    expect(await waitForTopHeading('사용자 테스트 결과 제출')).toBeTruthy();
  }, 15000);

  it('Home 위에 Alerts를 push하고 뒤로가면 Home을 복원한다', async () => {
    const user = userEvent.setup();
    renderStack();

    await waitForTopHeading('홈');
    expect(document.title).toBe('홈 | YAPP+');
    expect(document.head.querySelectorAll('title')).toHaveLength(1);
    await user.click(screen.getByRole('link', { name: '알림' }));
    await waitFor(() => expect(window.location.pathname).toBe('/alerts'));
    expect(await waitForTopHeading('알림')).toBeTruthy();
    expect(document.title).toBe('알림 | YAPP+');
    expect(document.head.querySelectorAll('title')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: '뒤로가기' }));
    expect(await waitForTopHeading('홈')).toBeTruthy();
    await waitFor(() => expect(document.title).toBe('홈 | YAPP+'));
    expect(document.head.querySelectorAll('title')).toHaveLength(1);
  });

  it('Alerts에서 돌아오면 Home의 조회 조건과 URL query를 복원한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?session=team&attendance=attended');
    renderStack();

    const homeScreen = await waitForTopHeading('홈');
    expect(homeScreen.getByRole('heading', { name: '이번 주는 팀 세션이에요' })).toBeVisible();
    expect(homeScreen.getAllByText('출석').some(isVisible)).toBe(true);

    await user.click(homeScreen.getByRole('link', { name: '알림' }));
    expect(await waitForTopHeading('알림')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));

    const restoredHome = await waitForTopHeading('홈');
    expect(restoredHome.getByRole('heading', { name: '이번 주는 팀 세션이에요' })).toBeVisible();
    await waitFor(() => {
      expect(`${window.location.pathname}${window.location.search}`).toBe(
        '/?session=team&attendance=attended',
      );
    });
  });

  it('Alerts에서 다른 탭으로 이동하면 Alerts를 pop하고 탭을 replace한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/alerts');
    renderStack();

    const alertsScreen = await waitForTopHeading('알림');
    await user.click(alertsScreen.getByRole('link', { name: /^게시판$/ }));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    expect(await waitForTopHeading('게시판')).toBeTruthy();
  });

  it('알 수 없는 surface와 존재하지 않는 공지 ID는 실제 오류 화면을 표시한다', async () => {
    window.history.replaceState({}, '', '/unknown-surface');
    const notFoundRendered = renderStack();
    expect(await waitForTopHeading('페이지를 찾을 수 없어요')).toBeTruthy();
    notFoundRendered.unmount();

    window.history.replaceState({}, '', '/notices/missing');
    const rendered = renderStack();
    expect(await waitForTopHeading('앗, 오류가 발생했어요!')).toBeTruthy();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    rendered.unmount();
  });

  it('공지 상세 URL 직접 진입은 Notices를 fallback stack에 복원한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/notices/1');
    const detailRendered = renderStack();

    const detailScreen = await waitForTopHeading('6주차 세션 안내');
    await user.click(detailScreen.getByRole('button', { name: '뒤로가기' }));
    expect(await waitForTopHeading('게시판')).toBeTruthy();
    detailRendered.unmount();
  });

  it('출석 내역 직접 진입과 기존 mode query는 MY 복귀를 유지한다', async () => {
    window.history.replaceState({}, '', '/my/attendance?mode=none');
    const rendered = renderStack();
    const attendance = await waitForTopHeading('출석 내역');
    await userEvent.click(attendance.getByRole('button', { name: '뒤로가기' }));
    expect(await screen.findByText('마이페이지')).toBeVisible();
    await waitFor(() => expect(window.location.pathname.replace(/\/+$/, '')).toBe('/my'));
    rendered.unmount();
  });

  it('출석 규칙 직접 진입은 Attendance를 fallback stack에 복원한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/my/attendance/rules');
    renderStack();

    const rulesScreen = await waitForTopHeading('출석 규칙');
    await user.click(rulesScreen.getByRole('button', { name: '뒤로가기' }));
    await waitFor(() =>
      expect(window.location.pathname.replace(/\/+$/, '')).toBe('/my/attendance'),
    );
    expect(await waitForTopHeading('출석 내역')).toBeTruthy();
  });

  it('팀 출석 업로드는 swipe back을 차단하고 query에 따라 완료·오류로 이동한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/team-attendance/upload?error=true');
    renderStack();

    const uploadScreen = await waitForTopHeading('팀 세션 인증');
    expect(document.querySelector('[data-part="edge"]')).not.toBeInTheDocument();
    await user.click(uploadScreen.getByRole('button', { name: '확인' }));
    expect(await waitForTopHeading('인증 사진을 업로드하지 못했어요')).toBeTruthy();
  });

  it('가입 상태 직접 진입은 Login fallback과 가입 입력 흐름을 유지한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/signup/status');
    const rendered = renderStack();

    const statusScreen = await waitForTopHeading('운영진 승인을 기다리고 있어요...');
    await user.click(statusScreen.getByRole('button', { name: '뒤로가기' }));
    await waitFor(() => expect(window.location.pathname.replace(/\/+$/, '')).toBe('/login'));

    const loginScreen = await waitForTopHeading(/당신의 작은 아이디어가/);
    await user.click(loginScreen.getByRole('button', { name: '애플로 계속하기' }));
    expect(loginScreen.getByText(/YAPP\+ 앱에서 이용할 수 있어요/)).toBeInTheDocument();

    rendered.unmount();
    window.history.replaceState({}, '', '/signup');
    renderStack();
    const signupScreen = await waitForTopHeading('이름을 입력해 주세요');
    await user.type(signupScreen.getByRole('textbox', { name: '이름을 입력해 주세요' }), '홍길동');
    await user.click(signupScreen.getByRole('button', { name: '다음' }));
    expect(await waitForTopHeading('휴대폰 번호를 입력해 주세요')).toBeTruthy();
  });

  it('완료·개발 경로와 reduced motion 셸을 실제 화면에 연결한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/signup/complete');
    const rendered = renderStack();
    const completeScreen = await waitForTopHeading('회원가입을 완료했어요!');
    await user.click(completeScreen.getByRole('link', { name: '시작하기' }));
    expect(await waitForTopHeading('홈')).toBeTruthy();
    rendered.unmount();

    window.history.replaceState({}, '', '/dev/routes');
    const devRendered = renderStack();
    expect(await waitForTopHeading('개발용 화면 목록')).toBeTruthy();
    expect(screen.getByRole('link', { name: '가입 완료' })).toBeVisible();
    devRendered.unmount();

    window.history.replaceState({}, '', '/');
    const { Stack } = createStackflowApp({ reducedMotion: true });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>로딩 중…</div>}>
          <Stack initialContext={{ platform: 'ios', reducedMotion: true }} />
        </Suspense>
      </QueryClientProvider>,
    );
    expect(await waitForTopHeading('홈')).toBeTruthy();
    expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
  }, 15000);

  it('일정 직접 진입과 탭 복귀에서 실제 조회 목록을 유지한다', async () => {
    vi.stubEnv('VITE_API_MOCKING', 'true');
    window.history.replaceState({}, '', '/schedule');
    const user = userEvent.setup();
    renderStack();
    const schedule = await waitForTopHeading('일정');
    expect(await schedule.findByRole('list', { name: '세션 일정 목록' })).toBeVisible();
    const titles = schedule.getAllByRole('article').map((article) => article.textContent);
    await user.click(screen.getByRole('link', { name: /^홈$/ }));
    await waitForTopHeading('홈');
    await user.click(screen.getByRole('link', { name: /^일정$/ }));
    const restored = await waitForTopHeading('일정');
    expect(restored.getAllByRole('article').map((article) => article.textContent)).toEqual(titles);
    expect(window.location.pathname).toBe('/schedule');
  });

  it('전체 Stackflow Activity route를 등록한다', () => {
    expect(stackflowConfig.activities.map((activity) => activity.name)).toEqual([
      'Tabs',
      'AttendanceCode',
      'AttendanceReport',
      'TeamAttendanceGuide',
      'Alerts',
      'NoticeDetail',
      'Attendance',
      'AttendanceRules',
      'AttendanceComplete',
      'Settings',
      'TeamAttendanceUpload',
      'TeamAttendanceError',
      'TeamAttendanceComplete',
      'Login',
      'LoginError',
      'Error',
      'Signup',
      'SignupStatus',
      'SignupComplete',
      'SignupUnregistered',
      'DevRoutes',
      'NotFound',
    ]);
  });
});

it('출석 시트를 뒤로가기로 닫고 다시 열면 입력을 초기화한다', async () => {
  window.history.replaceState({}, '', '/?session=team');
  const user = userEvent.setup();
  renderStack();
  const home = await waitForTopHeading('홈');
  await user.click(home.getByRole('button', { name: '정기 세션 화면으로 전환' }));
  await user.click(home.getByRole('button', { name: '출석하기' }));
  const input = await screen.findByRole('textbox', { name: '출석 코드 1번째 자리' });
  fireEvent.change(input, { target: { value: '7' } });
  await waitFor(() => expect(window.location.pathname).toBe('/attendance/code'));
  await waitFor(() =>
    expect(document.querySelector('[data-global-transition-state]')).toHaveAttribute(
      'data-global-transition-state',
      'enter-done',
    ),
  );
  window.history.back();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(window.location.pathname).toBe('/');
  await user.click(home.getByRole('button', { name: '출석하기' }));
  expect(await screen.findByRole('textbox', { name: '출석 코드 1번째 자리' })).toHaveValue('');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(window.location.pathname).toBe('/');
}, 15000);

it('팀 안내 시트를 업로드 화면으로 교체해서 뒤로가면 홈으로 돌아온다', async () => {
  window.history.replaceState({}, '', '/?session=team');
  const user = userEvent.setup();
  renderStack();
  const home = await waitForTopHeading('홈');
  await user.click(home.getByRole('button', { name: '인증 사진 올리기' }));
  await screen.findByRole('button', { name: '앨범에서 선택하기' });
  await waitFor(() => expect(window.location.pathname).toBe('/team-attendance/guide'));
  await waitFor(() =>
    expect(document.querySelector('[data-global-transition-state]')).toHaveAttribute(
      'data-global-transition-state',
      'enter-done',
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: '앨범에서 선택하기' }));
  await waitFor(() => expect(window.location.pathname).toBe('/team-attendance/upload'));
  await waitForTopHeading('팀 세션 인증');
  window.history.back();
  await waitFor(() => expect(window.location.pathname).toBe('/'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}, 15000);

it('출결 보고 시트에서 완료하면 홈으로 돌아가고 알림을 표시한다', async () => {
  window.history.replaceState({}, '', '/attendance/report');
  renderStack();
  fireEvent.click(await screen.findByRole('radio', { name: '결석' }));
  fireEvent.click(screen.getByTestId('report-step1-submit'));
  fireEvent.change(screen.getByRole('textbox', { name: '결석 사유' }), {
    target: { value: '개인 일정' },
  });
  fireEvent.click(screen.getByTestId('report-step2-submit'));
  expect(await screen.findByText('출결 보고를 완료했어요')).toBeVisible();
  await waitFor(() => expect(window.location.pathname).toBe('/'));
});

it('모의 API를 사용하지 않으면 시트 URL로 직접 진입해도 입력 폼을 제공하지 않는다', async () => {
  vi.stubEnv('VITE_API_MOCKING', 'false');
  window.history.replaceState({}, '', '/attendance/code');
  renderStack();
  await waitForTopHeading('페이지를 찾을 수 없어요');
  expect(screen.queryByRole('textbox', { name: '출석 코드 1번째 자리' })).not.toBeInTheDocument();
});
