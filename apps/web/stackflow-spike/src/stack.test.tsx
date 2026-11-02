import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  await waitFor(() =>
    expect(
      document.querySelector(
        '[data-stackflow-component-name="AppScreen"][data-activity-is-top][data-transition-state="enter-done"]',
      ),
    ).toBeInTheDocument(),
  );
}

describe('Stackflow 탭·Alerts 구조', () => {
  it('탭 전환은 replaceStep으로 history를 늘리지 않고 패널 상태를 보존한다', async () => {
    renderStack();

    expect(
      await screen.findByRole('heading', { name: '홈 패널' }, { timeout: 5000 }),
    ).toBeVisible();
    fireEvent.change(screen.getByTestId('home-state'), { target: { value: '보존할 홈 상태' } });
    const historyLength = window.history.length;

    fireEvent.click(screen.getByTestId('tab-schedule'));
    await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
    fireEvent.change(screen.getByTestId('schedule-state'), { target: { value: '이번 달' } });

    fireEvent.click(screen.getByTestId('tab-notices'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    fireEvent.change(screen.getByTestId('notices-state'), { target: { value: '세션' } });

    fireEvent.click(screen.getByTestId('tab-home'));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(screen.getByTestId('home-state')).toHaveValue('보존할 홈 상태');

    fireEvent.click(screen.getByTestId('tab-schedule'));
    await waitFor(() => expect(window.location.pathname).toBe('/schedule'));
    expect(screen.getByTestId('schedule-state')).toHaveValue('이번 달');

    fireEvent.click(screen.getByTestId('tab-notices'));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    expect(screen.getByTestId('notices-state')).toHaveValue('세션');
    expect(window.history.length).toBe(historyLength);
  });

  it('Home 위에 Alerts를 push하고 뒤로가면 Home을 복원한다', async () => {
    renderStack();

    fireEvent.click(await screen.findByTestId('open-alerts'));
    await waitForTopActivity();
    await waitFor(() => expect(window.location.pathname).toBe('/alerts'));
    expect(await screen.findByRole('heading', { name: '알림' }, { timeout: 5000 })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '뒤로' }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(
      await screen.findByRole('heading', { name: '홈 패널' }, { timeout: 5000 }),
    ).toBeVisible();
  });

  it('Alerts 직접 진입은 Home을 복원하고 다른 탭 이동은 pop + replace로 처리한다', async () => {
    window.history.replaceState({}, '', '/alerts');
    renderStack();

    await waitForTopActivity();
    expect(await screen.findByRole('heading', { name: '알림' }, { timeout: 5000 })).toBeVisible();
    fireEvent.click(screen.getByTestId('alerts-notices'));

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
    window.history.replaceState({}, '', '/notices/direct-entry');
    renderStack();

    const detailHeading = await screen.findByRole(
      'heading',
      { name: 'direct-entry' },
      { timeout: 5000 },
    );
    await waitFor(() => expect(detailHeading).toBeVisible());
    expect(screen.getByText('공지 패널')).toBeInTheDocument();
  });

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
      'NotFound',
    ]);
  });
});
