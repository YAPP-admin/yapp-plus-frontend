/** 실제 생성 SDK와 Query의 커서·우선순위·실패 경계를 검증하며 UI 표시 기록은 하지 않습니다. */
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fakeAttendanceHistoryItemResponse,
  fakeCurrentGenerationSessionItemResponse,
  fakeCurrentWeekSessionDetailResponse,
  fakeUserTeamPhotoDetailResponse,
} from '@yapp-plus/api/generated/faker';
import { find1Options } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';
import { createTeamAttendanceResultStorage } from './team-attendance-result-storage';
import { useTeamAttendanceResult } from './use-team-attendance-result';

const SESSION = {
  ...fakeCurrentGenerationSessionItemResponse(),
  type: 'TEAM' as const,
  date: '2026-11-26',
  endDate: '2026-11-26',
  startTime: '14:00',
  endTime: '18:00',
};
const PHOTO = {
  ...fakeUserTeamPhotoDetailResponse(),
  photoId: 203,
  status: 'REJECTED' as const,
  uploadedTime: '14:00',
  selectedMemberCount: 1,
};
const API = { baseUrl: apiBaseUrl, retry: 0 };
const NOW = Date.parse('2026-11-26T06:00:00Z');

function setup({
  shown = false,
  failure = false,
  future = false,
  priority = false,
  empty = false,
  invalidPhoto = false,
} = {}) {
  const calls: number[] = [];
  const cursors: (string | null)[] = [];
  const storage = createTeamAttendanceResultStorage(() => ({
    getItem: () => null,
    setItem: () => {},
  }));
  const ids = empty ? Array.from({ length: 40 }, (_, index) => index + 1) : [3, 2, 1];
  const sessions = ids.map((sessionId) => ({
    ...SESSION,
    sessionId,
    startTime: future ? '16:00' : '14:00',
  }));
  const items = (empty ? [] : sessions).map(({ sessionId }) => ({
    ...fakeAttendanceHistoryItemResponse(),
    sessionId,
    attendanceStatus: 'UNDECIDED' as const,
    staffDecisionStatus: 'REJECTED' as const,
  }));
  if (shown) {
    storage.markShown(
      { userId: 7, generationId: 28 },
      { sessionId: 3, photoId: 203, kind: 'REJECTED' },
    );
  }
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, () =>
      HttpResponse.json({ generationId: 28, generationNumber: 28, sessions }),
    ),
    http.get(`${apiBaseUrl}/api/sessions/current-week`, () =>
      HttpResponse.json({
        weekStartDate: '2026-11-22',
        weekEndDate: '2026-11-28',
        session: priority
          ? {
              ...fakeCurrentWeekSessionDetailResponse(),
              ...sessions[1],
              attendanceStatus: 'AVAILABLE',
            }
          : null,
      }),
    ),
    http.get(`${apiBaseUrl}/api/attendance-history`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      cursors.push(cursor);
      return HttpResponse.json({
        summary: { totalSessionCount: 3, startedSessionCount: 3 },
        items: cursor ? items.slice(1) : items.slice(0, 1),
        nextCursor: cursor || empty ? null : 'next',
      });
    }),
    http.get(`${apiBaseUrl}/api/sessions/:sessionId/team-attendance-photos`, ({ params }) => {
      calls.push(Number(params.sessionId));
      return failure
        ? HttpResponse.json({ code: 'FORBIDDEN', message: '접근 불가' }, { status: 403 })
        : HttpResponse.json({ photo: { ...PHOTO, photoId: invalidPhoto ? -1 : PHOTO.photoId } });
    }),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // 캐시가 있어도 이번 진입의 사진 재조회가 실패하면 표시하지 않아야 합니다.
  client.setQueryData(find1Options({ ...API, path: { sessionId: 3 } }).queryKey, { photo: PHOTO });
  const hook = renderHook(
    ({ enabled }) =>
      useTeamAttendanceResult({ userId: 7, enabled, storage, apiOptions: API, now: NOW }),
    {
      initialProps: { enabled: true },
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );
  return { ...hook, calls, cursors, storage, client };
}

it('첫 미표시 결과에서 다음 페이지와 사진 탐색을 중단하고 기록하지 않는다', async () => {
  const hook = setup();
  await waitFor(() => {
    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.result?.sessionId).toBe(3);
  });
  expect(hook.calls).toEqual([3]);
  expect(hook.cursors).toEqual([null]);
  expect(
    hook.storage.hasShown(
      { userId: 7, generationId: 28 },
      { sessionId: 3, photoId: 203, kind: 'REJECTED' },
    ),
  ).toBe(false);
  hook.rerender({ enabled: false });
  expect(hook.result.current.result).toBeNull();
});

it('이미 본 사진을 건너뛰고 커서 다음 페이지의 결과를 찾는다', async () => {
  const hook = setup({ shown: true });
  await waitFor(() => expect(hook.result.current.result?.sessionId).toBe(2));
  expect(hook.cursors).toEqual([null, 'next']);
  expect(hook.calls).toEqual([3, 2]);
});

it('더 최신 세션보다 재업로드 가능한 반려를 먼저 찾는다', async () => {
  const hook = setup({ priority: true });
  await waitFor(() =>
    expect(hook.result.current.result).toMatchObject({ sessionId: 2, reupload: 'AVAILABLE' }),
  );
  expect(hook.calls).toEqual([2]);
});

it.each([{ failure: true }, { invalidPhoto: true }])(
  '사진 조회·검증 실패는 캐시나 photo:null로 대체하지 않는다: %j',
  async (options) => {
    const hook = setup(options);
    await waitFor(() => expect(hook.result.current.error).toBeTruthy());
    expect(hook.result.current.result).toBeNull();
    expect(hook.calls).toEqual([3]);
  },
);

it('본인 내역이 없는 긴 세션 목록은 추가 렌더와 사진 조회 없이 종료한다', async () => {
  const hook = setup({ empty: true });
  await waitFor(() => expect(hook.result.current.isComplete).toBe(true));
  expect(hook.calls).toEqual([]);
});

it('홈 비활성화 뒤 도착한 사진 응답은 반환하거나 기록하지 않는다', async () => {
  const hook = setup();
  let release: (() => void) | undefined;
  let requested = false;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  server.use(
    http.get(`${apiBaseUrl}/api/sessions/:sessionId/team-attendance-photos`, async () => {
      requested = true;
      await pending;
      return HttpResponse.json({ photo: PHOTO });
    }),
  );
  await waitFor(() => expect(requested).toBe(true));
  hook.rerender({ enabled: false });
  await act(async () => {
    release?.();
    await pending;
  });
  await waitFor(() => expect(hook.client.isFetching()).toBe(0));
  expect(hook.result.current.result).toBeNull();
  expect(
    hook.storage.hasShown(
      { userId: 7, generationId: 28 },
      { sessionId: 3, photoId: 203, kind: 'REJECTED' },
    ),
  ).toBe(false);
});

it('시작 전 내역이 잘못 제공되어도 사진 조회와 안내를 하지 않는다', async () => {
  const hook = setup({ future: true });
  await waitFor(() => expect(hook.client.isFetching()).toBe(0));
  expect(hook.result.current.result).toBeNull();
  expect(hook.calls).toEqual([]);
});
