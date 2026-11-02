import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStackflowApp, stackflowConfig, Stack } from './stack';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('Stackflow 호환성 셸', () => {
  it('Home → Notices → NoticeDetail을 typed Link로 이동하고 browser back으로 복귀한다', async () => {
    render(
      <Suspense fallback={<div>로딩 중…</div>}>
        <Stack />
      </Suspense>,
    );

    fireEvent.click(await screen.findByTestId('notices-link', {}, { timeout: 5000 }));
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));

    fireEvent.click(await screen.findByTestId('notice-detail-link', {}, { timeout: 5000 }));
    await waitFor(() => expect(window.location.pathname).toBe('/notices/spike-notice'));
    expect(
      await screen.findByRole('heading', { name: 'spike-notice' }, { timeout: 5000 }),
    ).toBeVisible();

    window.history.back();
    await waitFor(() => expect(window.location.pathname).toBe('/notices'));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('heading', { name: '공지 목록' })
          .some((heading) => heading.checkVisibility()),
      ).toBe(true),
    );
  });

  it('공지 상세 route가 defaultHistory로 Home과 Notices를 복원하도록 선언되어 있다', () => {
    const detailActivity = stackflowConfig.activities.find(
      (activity) => activity.name === 'NoticeDetail',
    );

    expect(detailActivity?.route).toMatchObject({ path: '/notices/:noticeId' });
    if (
      !detailActivity ||
      typeof detailActivity.route === 'string' ||
      Array.isArray(detailActivity.route)
    ) {
      throw new Error('NoticeDetail route가 객체로 선언되어야 합니다.');
    }

    expect(detailActivity.route.defaultHistory?.({ noticeId: 'direct-entry' })).toEqual([
      { activityName: 'Home', activityParams: {} },
      { activityName: 'Notices', activityParams: {} },
      { activityName: 'NoticeDetail', activityParams: { noticeId: 'direct-entry' } },
    ]);
  });

  it('공지 상세 URL 직접 진입 시 Home → Notices → Detail을 실제 스택으로 복원한다', async () => {
    window.history.replaceState({}, '', '/notices/direct-entry');
    const { Stack: DirectEntryStack } = createStackflowApp();

    render(
      <Suspense fallback={<div>로딩 중…</div>}>
        <DirectEntryStack />
      </Suspense>,
    );

    expect(
      await screen.findByRole('heading', { name: 'direct-entry' }, { timeout: 5000 }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '공지 목록' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Home Activity' })).toBeInTheDocument();
  });

  it('reduced motion 셸은 전환 정책 표식을 유지하면서 화면을 렌더링한다', async () => {
    window.history.replaceState({}, '', '/');
    const { Stack: ReducedMotionStack } = createStackflowApp({ reducedMotion: true });

    render(
      <Suspense fallback={<div>로딩 중…</div>}>
        <ReducedMotionStack initialContext={{ platform: 'ios', reducedMotion: true }} />
      </Suspense>,
    );

    expect(await screen.findByRole('heading', { name: 'Home Activity' })).toBeVisible();
    expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
  });
});
