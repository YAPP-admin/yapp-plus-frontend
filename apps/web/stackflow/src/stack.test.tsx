import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationHistory } from '@/app/navigation/navigation-history';
import { createStackflowApp, stackflowConfig } from './stack';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

function renderStack() {
  const { Stack } = createStackflowApp();

  return render(
    <NavigationHistory>
      <Suspense fallback={<div>로딩 중…</div>}>
        <Stack />
      </Suspense>
    </NavigationHistory>,
  );
}

async function waitForTopHeading(name: string | RegExp) {
  let element: HTMLElement | null = null;
  await waitFor(
    () => {
      element =
        [
          ...document.querySelectorAll<HTMLElement>('[data-stackflow-component-name="AppScreen"]'),
        ].find((candidate) => {
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
  it('비활성 탭은 상태를 보존하되 effect를 실행하지 않는다', async () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    window.history.replaceState({}, '', '/schedule');
    renderStack();

    expect(await waitForTopHeading('일정')).toBeTruthy();
    expect(addEventListener.mock.calls.some(([eventName]) => eventName === 'pointerdown')).toBe(
      false,
    );
  });

  it('web에서는 화면별 prop을 생략해도 swipe edge를 렌더링하지 않는다', async () => {
    window.history.replaceState({}, '', '/alerts');
    renderStack();

    expect(await waitForTopHeading('알림')).toBeTruthy();
    expect(document.querySelector('[data-part="edge"]')).not.toBeInTheDocument();
  });

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
    await user.click(noticesScreen.getByRole('link', { name: /과제 공지: 팀빌딩 소개서 작성/ }));

    await waitFor(() => expect(window.location.pathname).toBe('/notices/1'));
    expect(await waitForTopHeading('팀빌딩 소개서 작성')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '뒤로가기' }));

    const restored = await waitForTopHeading('게시판');
    expect(restored.getByRole('tab', { name: '과제' })).toHaveAttribute('aria-selected', 'true');
  });

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

    const detailScreen = await waitForTopHeading('팀빌딩 소개서 작성');
    await user.click(detailScreen.getByRole('button', { name: '뒤로가기' }));
    expect(await waitForTopHeading('게시판')).toBeTruthy();
    detailRendered.unmount();
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
    renderStack();

    const statusScreen = await waitForTopHeading('운영진 승인을 기다리고 있어요...');
    await user.click(statusScreen.getByRole('button', { name: '뒤로가기' }));
    await waitFor(() => expect(window.location.pathname.replace(/\/+$/, '')).toBe('/login'));

    const loginScreen = await waitForTopHeading(/당신의 작은 아이디어가/);
    await user.click(loginScreen.getByRole('button', { name: '애플로 계속하기' }));
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
    render(
      <Suspense fallback={<div>로딩 중…</div>}>
        <Stack initialContext={{ platform: 'ios', reducedMotion: true }} />
      </Suspense>,
    );
    expect(await waitForTopHeading('홈')).toBeTruthy();
    expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
  }, 15000);

  it('전체 Stackflow Activity route를 등록한다', () => {
    expect(stackflowConfig.activities.map((activity) => activity.name)).toEqual([
      'Tabs',
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
