import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStackflowApp, stackflowConfig } from './stack';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

function renderStack() {
  const { Stack } = createStackflowApp();

  return render(
    <Suspense fallback={<div>로딩 중…</div>}>
      <Stack />
    </Suspense>,
  );
}

async function waitForTopActivity() {
  let element: HTMLElement | null = null;
  await waitFor(() => {
    element = document.querySelector(
      '[data-stackflow-component-name="AppScreen"][data-activity-is-top][data-transition-state="enter-done"]',
    );
    expect(element).toBeInTheDocument();
  });

  if (!element) {
    throw new Error('최상단 Activity를 찾지 못했습니다.');
  }

  return within(element);
}

async function waitForTopHeading(name: string) {
  let element: HTMLElement | null = null;
  await waitFor(() => {
    element =
      [
        ...document.querySelectorAll<HTMLElement>(
          '[data-stackflow-component-name="AppScreen"][data-activity-is-top][data-transition-state="enter-done"]',
        ),
      ].find((candidate) => candidate.querySelector('h1')?.textContent === name) ?? null;
    expect(element).toBeInTheDocument();
  });

  if (!element) {
    throw new Error(`최상단 Activity(${name})를 찾지 못했습니다.`);
  }

  return within(element);
}

describe('Stackflow 탭·Alerts 구조', () => {
  it('탭 전환은 replaceStep으로 history를 늘리지 않고 패널 상태를 보존한다', async () => {
    const user = userEvent.setup();
    renderStack();

    expect(
      await screen.findByRole('heading', { name: '홈 패널' }, { timeout: 5000 }),
    ).toBeVisible();
    await user.type(screen.getByTestId('home-state'), '보존할 홈 상태');
    const historyLength = window.history.length;

    await user.click(screen.getByTestId('tab-schedule'));
    await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
    await user.selectOptions(screen.getByTestId('schedule-state'), '이번 달');

    await user.click(screen.getByTestId('tab-notices'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    await user.click(screen.getByTestId('notice-filter-session'));

    await user.click(screen.getByTestId('tab-home'));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(screen.getByTestId('home-state')).toHaveValue('보존할 홈 상태');

    await user.click(screen.getByTestId('tab-schedule'));
    await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
    expect(screen.getByTestId('schedule-state')).toHaveValue('이번 달');

    await user.click(screen.getByTestId('tab-notices'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    expect(screen.getByTestId('notice-filter-session')).toHaveAttribute('aria-selected', 'true');
    expect(window.history.length).toBe(historyLength);
  });

  it('공지 목록에서 상세로 이동하고 browser back으로 필터·스크롤 상태를 복원한다', async () => {
    const user = userEvent.setup();
    renderStack();

    await user.click(await screen.findByTestId('tab-notices'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    await user.click(screen.getByTestId('notice-filter-assignment'));
    const noticesScroll = screen.getByTestId('notices-scroll');
    Object.assign(noticesScroll, { scrollTop: 120 });

    await user.click(screen.getByTestId('notice-item-1'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices/1'));
    const detailHeading = await screen.findByRole('heading', { name: '팀빌딩 소개서 작성' });
    await waitFor(() => expect(detailHeading).toBeVisible());

    await user.click(screen.getByRole('button', { name: '뒤로' }));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    expect(screen.getByTestId('notice-filter-assignment')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('notices-scroll')).toHaveProperty('scrollTop', 120);
  });

  it('Home 위에 Alerts를 push하고 뒤로가면 Home을 복원한다', async () => {
    const user = userEvent.setup();
    renderStack();

    expect(await screen.findByRole('heading', { name: '홈 패널' })).toBeVisible();
    await user.click(await screen.findByTestId('open-alerts'));
    await waitForTopActivity();
    await waitFor(() => expect(window.location.pathname).toBe('/alerts'));
    expect(await screen.findByRole('heading', { name: '알림' }, { timeout: 5000 })).toBeVisible();

    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(
      await screen.findByRole('heading', { name: '홈 패널' }, { timeout: 5000 }),
    ).toBeVisible();
  });

  it('Alerts 직접 진입은 Home을 복원하고 다른 탭 이동은 pop + replace로 처리한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/alerts');
    renderStack();

    await waitForTopActivity();
    expect(await screen.findByRole('heading', { name: '알림' }, { timeout: 5000 })).toBeVisible();
    await user.click(screen.getByTestId('alerts-notices'));

    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    expect(
      await screen.findByRole('heading', { name: '공지 패널' }, { timeout: 5000 }),
    ).toBeVisible();
  });

  it('알 수 없는 surface는 NotFound Activity로 표시한다', async () => {
    window.history.replaceState({}, '', '/unknown-surface');
    renderStack();

    expect(
      await screen.findByRole('heading', { name: '요청한 화면을 찾을 수 없습니다.' }),
    ).toBeVisible();
  });

  it('공지 상세 URL 직접 진입은 Notices 탭 위에 상세를 복원한다', async () => {
    window.history.replaceState({}, '', '/notices/1');
    renderStack();

    const detailHeading = await screen.findByRole(
      'heading',
      { name: '팀빌딩 소개서 작성' },
      { timeout: 5000 },
    );
    await waitFor(() => expect(detailHeading).toBeVisible());
    expect(screen.getByText('공지 패널')).toBeInTheDocument();
  });

  it('존재하지 않는 공지 ID는 상세 오류 상태를 표시한다', async () => {
    window.history.replaceState({}, '', '/notices/missing');
    renderStack();

    const notFoundHeading = await screen.findByRole('heading', {
      name: '공지사항을 찾을 수 없습니다.',
    });
    await waitFor(() => expect(notFoundHeading).toBeVisible());
    expect(screen.getByText('요청한 공지 ID(missing)가 존재하지 않습니다.')).toBeInTheDocument();
  });

  it('출석·규칙·설정 직접 진입은 기존 fallback stack을 복원한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/my/attendance/rules');
    renderStack();
    await new Promise((resolve) => window.setTimeout(resolve, 3000));

    const rulesScreen = await waitForTopHeading('출석 규칙');
    expect(rulesScreen.getByRole('heading', { name: '출석 규칙' })).toBeVisible();
    await user.click(rulesScreen.getByRole('button', { name: '뒤로' }));
    await waitFor(() => expect(window.location.pathname).toBe('/my/attendance'));
    const attendanceScreen = await waitForTopHeading('출석 내역');
    expect(attendanceScreen.getByRole('heading', { name: '출석 내역' })).toBeVisible();
  }, 10000);

  it('팀 출석 업로드는 입력 중 swipe back을 차단하고 완료·오류 흐름을 분기한다', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/team-attendance/upload');
    renderStack();
    await new Promise((resolve) => window.setTimeout(resolve, 3000));

    const uploadScreen = await waitForTopHeading('팀 세션 인증 사진 올리기');
    expect(uploadScreen.getByRole('heading', { name: '팀 세션 인증 사진 올리기' })).toBeVisible();
    expect(document.querySelector('[data-part="edge"]')).not.toBeInTheDocument();
    await user.click(uploadScreen.getByTestId('team-upload-error'));
    const errorScreen = await waitForTopHeading('팀 세션 인증 오류');
    expect(errorScreen.getByRole('heading', { name: '팀 세션 인증 오류' })).toBeVisible();
    await user.click(errorScreen.getByTestId('team-error-retry-link'));
    const retryUploadScreen = await waitForTopHeading('팀 세션 인증 사진 올리기');
    expect(
      retryUploadScreen.getByRole('heading', { name: '팀 세션 인증 사진 올리기' }),
    ).toBeVisible();
  }, 10000);

  it('reduced motion 셸은 전환 정책 표식을 유지하면서 화면을 렌더링한다', async () => {
    const { Stack } = createStackflowApp({ reducedMotion: true });

    render(
      <Suspense fallback={<div>로딩 중…</div>}>
        <Stack initialContext={{ platform: 'ios', reducedMotion: true }} />
      </Suspense>,
    );

    expect(
      await screen.findByRole('heading', { name: '홈 패널' }, { timeout: 5000 }),
    ).toBeVisible();
    expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
  });

  it('탭·Alerts·NotFound·상세 경로가 스파이크 route 설정에 등록되어 있다', () => {
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
      'NotFound',
    ]);
  });
});
