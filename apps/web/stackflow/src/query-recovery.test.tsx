/** 실제 탭·상세 탐색에서 조회 복구와 캐시 수명을 검증합니다. */
import { QueryClientProvider } from '@tanstack/react-query';
import { find5Options } from '@yapp-plus/api/generated';
import { SnackbarProvider } from '@yapp-plus/ui';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Suspense } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAppQueryClient } from '@/app/providers';
import { memberScoreQueryOptions } from '@/features/member-attendance';
import { scoreFixture } from '@/mocks/member-attendance-handlers';
import { scheduleFixture } from '@/mocks/session-handlers';
import { apiBaseUrl, server } from '@/mocks/server';
import { createStackflowApp } from './stack';

const scheduleUrl = `${apiBaseUrl}/api/generations/current/sessions`;
const scoreUrl = `${apiBaseUrl}/api/attendance-scores/me`;
const popstateListeners: EventListenerOrEventListenerObject[] = [];
const addWindowListener = window.addEventListener.bind(window);

beforeEach(() => {
  vi.stubEnv('VITE_API_MOCKING', 'true');
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'popstate' && listener) {
      popstateListeners.push(listener);
    }
    addWindowListener(type, listener, options);
  });
});

afterEach(() => {
  for (const listener of popstateListeners.splice(0)) {
    window.removeEventListener('popstate', listener);
  }
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.history.replaceState({}, '', '/');
});

async function renderStack(path: string, client = createAppQueryClient()) {
  window.history.replaceState({}, '', path);
  const { Stack, actions } = createStackflowApp({ reducedMotion: true });
  render(
    <QueryClientProvider client={client}>
      <SnackbarProvider>
        <Suspense fallback={<p>로딩 중…</p>}>
          <Stack initialContext={{ platform: 'web', reducedMotion: true }} />
        </Suspense>
      </SnackbarProvider>
    </QueryClientProvider>,
  );
  await waitFor(
    () => expect(document.title).toBe(`${path === '/schedule' ? '일정' : '마이페이지'} | YAPP+`),
    { timeout: 10000 },
  );
  return { client, actions, user: userEvent.setup() };
}

async function settle() {
  // 네트워크 응답 이후 Effect 재실행으로 생기는 중복 요청도 집계합니다.
  await act(async () => new Promise((resolve) => setTimeout(resolve, 100)));
}

// 첫 진입의 lazy 화면 로딩과 탐색을 포함하므로 내부 10초 대기보다 긴 한도를 둡니다.
it('일정 오류는 숨겨진 동안 재시도하지 않고 탭 복귀 시 한 번 복구한다', async () => {
  let calls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      calls++;
      return calls === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json(scheduleFixture);
    }),
  );
  const { user } = await renderStack('/schedule');
  await screen.findByRole('button', { name: '다시 시도' });
  await user.click(screen.getByRole('tab', { name: /^홈$/ }));
  await screen.findByRole('heading', { name: '홈' });
  await settle();
  expect(calls).toBe(1);
  await user.click(screen.getByRole('tab', { name: /^일정$/ }));
  await screen.findByRole('list', { name: '세션 일정 목록' });
  await settle();
  expect(calls).toBe(2);
}, 15000);

it('첫 진입 전에 조회가 실패해도 화면 복귀 전에는 재시도하지 않는다', async () => {
  let calls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      calls++;
      return calls === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json(scheduleFixture);
    }),
  );
  const client = createAppQueryClient();
  await expect(
    client.fetchQuery(find5Options({ retry: 0, kyOptions: { throwHttpErrors: false } })),
  ).rejects.toBeDefined();
  const { user } = await renderStack('/schedule', client);
  await screen.findByRole('button', { name: '다시 시도' });
  await settle();
  expect(calls).toBe(1);
  await user.click(screen.getByRole('tab', { name: /^홈$/ }));
  await screen.findByRole('heading', { name: '홈' });
  await user.click(screen.getByRole('tab', { name: /^일정$/ }));
  await screen.findByRole('list', { name: '세션 일정 목록' });
  expect(calls).toBe(2);
});

it('반복 실패해도 복귀당 한 번만 재시도하고 수동 재시도를 유지한다', async () => {
  let calls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      calls++;
      return calls < 3
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json(scheduleFixture);
    }),
  );
  const { user } = await renderStack('/schedule');
  await screen.findByRole('button', { name: '다시 시도' });
  await user.click(screen.getByRole('tab', { name: /^홈$/ }));
  await screen.findByRole('heading', { name: '홈' });
  await user.click(screen.getByRole('tab', { name: /^일정$/ }));
  await waitFor(() => expect(calls).toBe(2));
  const retry = await screen.findByRole('button', { name: '다시 시도' });
  await settle();
  expect(calls).toBe(2);
  retry.focus();
  await user.keyboard('{Enter}');
  await screen.findByRole('list', { name: '세션 일정 목록' });
  expect(calls).toBe(3);
});

it.each([false, true])('탭 복귀는 기존 stale 재조회 정책을 유지한다 (stale=%s)', async (stale) => {
  let calls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      calls++;
      return HttpResponse.json(scheduleFixture);
    }),
  );
  const { client, user } = await renderStack('/schedule');
  const list = await screen.findByRole('list', { name: '세션 일정 목록' });
  await user.click(screen.getByRole('tab', { name: /^홈$/ }));
  await screen.findByRole('heading', { name: '홈' });
  if (stale) {
    const key = find5Options().queryKey;
    act(() => {
      client.setQueryData(key, (current) => current, { updatedAt: Date.now() - 31_000 });
    });
  }
  await user.click(screen.getByRole('tab', { name: /^일정$/ }));
  await waitFor(() => expect(list).toBeVisible());
  await settle();
  expect(calls).toBe(stale ? 2 : 1);
  expect(screen.getByRole('list', { name: '세션 일정 목록' })).toBe(list);
});

it('MY 오류는 상세 화면에서 돌아오면 복구한다', async () => {
  let calls = 0;
  server.use(
    http.get(scoreUrl, () => {
      calls++;
      return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(scoreFixture);
    }),
  );
  const { user, actions } = await renderStack('/my');
  await screen.findByText('출석 현황을 불러오지 못했어요.');
  await user.click(screen.getByRole('link', { name: '설정' }));
  await waitFor(() => expect(document.title).toBe('설정 | YAPP+'));
  await settle();
  expect(calls).toBe(1);
  act(() => {
    actions.pop();
  });
  await screen.findByText('92점');
  await settle();
  expect(calls).toBe(2);
});

it.each([false, true])(
  '출석 내역에서 MY 복귀 시 stale 점수만 갱신한다 (stale=%s)',
  async (stale) => {
    let calls = 0;
    server.use(
      http.get(scoreUrl, () => {
        calls++;
        return HttpResponse.json({ ...scoreFixture, totalScore: calls === 1 ? 92 : 91 });
      }),
    );
    const { client, user, actions } = await renderStack('/my');
    await screen.findByText('92점');
    const menu = screen.getByRole('link', { name: '출석 내역' });
    await user.click(menu);
    await screen.findByRole('heading', { name: '출석 내역', level: 1 });
    await settle();
    expect(calls).toBe(1);
    if (stale) {
      const key = memberScoreQueryOptions().queryKey;
      act(() => {
        client.setQueryData(key, (current) => current, { updatedAt: Date.now() - 31_000 });
      });
    }
    act(() => {
      actions.pop();
    });
    await screen.findByText(stale ? '91점' : '92점');
    await settle();
    expect(calls).toBe(stale ? 2 : 1);
    expect(screen.getByRole('link', { name: '출석 내역' })).toBe(menu);
  },
);

it('상세 복귀는 진행 중인 재조회와 요청을 공유하고 이전 점수를 유지한다', async () => {
  let calls = 0;
  let finishRequest!: () => void;
  const pending = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });
  server.use(
    http.get(scoreUrl, async () => {
      calls++;
      if (calls > 1) {
        await pending;
      }
      return HttpResponse.json({ ...scoreFixture, totalScore: calls === 1 ? 92 : 91 });
    }),
  );
  const { client, user, actions } = await renderStack('/my');
  await screen.findByText('92점');
  await user.click(screen.getByRole('link', { name: '출석 내역' }));
  await screen.findByRole('heading', { name: '출석 내역', level: 1 });
  const key = memberScoreQueryOptions().queryKey;
  act(() => {
    client.setQueryData(key, (current) => current, { updatedAt: Date.now() - 31_000 });
    void client.refetchQueries({ queryKey: key, exact: true });
  });
  await waitFor(() => expect(calls).toBe(2));
  act(() => {
    actions.pop();
  });
  await waitFor(() => expect(screen.getByText('92점')).toBeVisible());
  await settle();
  expect(calls).toBe(2);
  await act(async () => {
    finishRequest();
    await pending;
  });
  await screen.findByText('91점');
  expect(calls).toBe(2);
});

it('상세 복귀가 다른 탭의 stale 조회를 실행하지 않는다', async () => {
  let scheduleCalls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      scheduleCalls++;
      return HttpResponse.json(scheduleFixture);
    }),
  );
  const { client, user, actions } = await renderStack('/schedule');
  await screen.findByRole('list', { name: '세션 일정 목록' });
  await user.click(screen.getByRole('tab', { name: 'MY' }));
  await screen.findByText('92점');
  await user.click(screen.getByRole('link', { name: '출석 내역' }));
  await screen.findByRole('heading', { name: '출석 내역', level: 1 });
  act(() => {
    client.setQueryData(find5Options().queryKey, (current) => current, {
      updatedAt: Date.now() - 31_000,
    });
    actions.pop();
  });
  await waitFor(() => expect(document.title).toBe('마이페이지 | YAPP+'));
  await settle();
  expect(scheduleCalls).toBe(1);
});

it('비활성 탭도 캐시 무효화 후 조회를 유지한다', async () => {
  let calls = 0;
  server.use(
    http.get(scheduleUrl, () => {
      calls++;
      return HttpResponse.json(scheduleFixture);
    }),
  );
  const { client, user } = await renderStack('/schedule');
  const list = await screen.findByRole('list', { name: '세션 일정 목록' });
  await user.click(screen.getByRole('tab', { name: 'MY' }));
  await screen.findByText('92점');
  await act(async () => {
    await client.invalidateQueries({ queryKey: find5Options().queryKey });
  });
  await waitFor(() => expect(calls).toBe(2));
  await user.click(screen.getByRole('tab', { name: '일정' }));
  expect(screen.getByRole('list', { name: '세션 일정 목록' })).toBe(list);
  await settle();
  expect(calls).toBe(2);
});
