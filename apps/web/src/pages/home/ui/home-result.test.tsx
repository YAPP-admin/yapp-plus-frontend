/** 홈의 실제 조회·시트·저장 흐름을 검증합니다. 관련 없는 카드·공지와 네이티브 인증 공급만 대체합니다. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import {
  fakeAttendanceHistoryItemResponse,
  fakeCurrentGenerationSessionItemResponse,
  fakeCurrentWeekSessionDetailResponse,
  fakeUserTeamPhotoDetailResponse,
} from '@yapp-plus/api/generated/faker';
import { apiBaseUrl, server } from '@/mocks/server';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { HomePage } from './home-page';

const auth = vi.hoisted(() => ({ userId: 7 }));
const push = vi.hoisted(() => vi.fn<(name: string, params: object) => void>());
vi.mock('@stackflow/react', () => ({ useFlow: () => ({ push }) }));
vi.mock('@seed-design/stackflow', () => ({ useActivityZIndexBase: () => 0 }));
vi.mock('@/features/auth', () => ({
  useNativeAuthSession: () => ({
    phase: 'SIGNED_IN',
    isNative: true,
    session: { userId: auth.userId, sessionId: `login-${auth.userId}` },
    apiOptions: { baseUrl: apiBaseUrl, retry: 0 },
  }),
}));
vi.mock('./current-week-card', () => ({ CurrentWeekCard: () => <p>이번 주 세션</p> }));
vi.mock('./weekly-notices', () => ({ WeeklyNotices: () => <p>이번 주 공지</p> }));
vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({ children }: { children: React.ReactNode }) => <a href="/schedule">{children}</a>,
}));
const session = {
  ...fakeCurrentGenerationSessionItemResponse(),
  sessionId: 101,
  type: 'TEAM',
  name: '과거 팀 세션',
  date: '2026-11-26',
  endDate: '2026-11-26',
  startTime: '14:00',
  endTime: '18:00',
};
const photo = {
  ...fakeUserTeamPhotoDetailResponse(),
  photoId: 203,
  status: 'REJECTED',
  uploadedTime: '14:00',
  selectedMemberCount: 1,
};
const storageKey = (userId = 7) => `yapp-plus:team-attendance:shown:v1:${userId}:28`;
let photoId = 203;
let status = 'UNDECIDED';
let failed = false;
let slow = false;
let queries = 0;

beforeEach(() => {
  vi.stubEnv('VITE_STATIC_CONTENT', 'false');
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-26T06:00:00Z'));
  focusManager.setFocused(true);
  localStorage.clear();
  auth.userId = 7;
  photoId = 203;
  status = 'UNDECIDED';
  failed = false;
  slow = false;
  queries = 0;
  server.use(
    http.get(`${apiBaseUrl}/api/generations/current/sessions`, async () => {
      queries++;
      if (slow) {
        await delay(100);
      }
      return HttpResponse.json({
        generationId: 28,
        generationNumber: 28,
        sessions: [session, { ...session, sessionId: 100 }],
      });
    }),
    http.get(`${apiBaseUrl}/api/sessions/current-week`, () =>
      HttpResponse.json({
        weekStartDate: '2026-11-22',
        weekEndDate: '2026-11-28',
        session: {
          ...fakeCurrentWeekSessionDetailResponse(),
          ...session,
          attendanceStatus: 'AVAILABLE',
        },
      }),
    ),
    http.get(`${apiBaseUrl}/api/attendance-history`, () =>
      HttpResponse.json({
        summary: { totalSessionCount: 2, startedSessionCount: 2 },
        nextCursor: null,
        items: [101, 100].map((sessionId) => ({
          ...fakeAttendanceHistoryItemResponse(),
          sessionId,
          attendanceStatus: status,
          staffDecisionStatus: 'REJECTED',
        })),
      }),
    ),
    http.get(`${apiBaseUrl}/api/sessions/:sessionId/team-attendance-photos`, () =>
      failed
        ? new HttpResponse(null, { status: 503 })
        : HttpResponse.json({ photo: { ...photo, photoId } }),
    ),
  );
});
afterEach(() => {
  focusManager.setFocused(undefined);
  vi.useRealTimers();
  vi.unstubAllEnvs();
  push.mockReset();
  localStorage.clear();
});

function setup(active = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = (enabled: boolean) => (
    <QueryClientProvider client={client}>
      <ScreenActiveContext value={enabled}>
        <HomePage />
      </ScreenActiveContext>
    </QueryClientProvider>
  );
  const view = render(tree(active));
  return { ...view, client, activate: (enabled: boolean) => view.rerender(tree(enabled)) };
}
async function shown() {
  const dialog = await screen.findByRole('dialog', { name: /팀 세션|결석으로/ });
  await waitFor(() => expect(localStorage.getItem(storageKey(auth.userId))).not.toBeNull());
  // happy-dom은 시트 transform 애니메이션을 실행하지 않습니다.
  dialog.style.transform = 'none';
  return dialog;
}

it('실제 표시 후 버튼 클릭 없이 기록하고 닫아도 같은 진입에서 다음 결과를 열지 않는다', async () => {
  setup();
  await shown();
  expect(JSON.parse(localStorage.getItem(storageKey()) ?? '{}')).toEqual({
    '101': { photoId: 203, result: 'REJECTED' },
  });
  fireEvent.keyDown(screen.getByRole('dialog', { name: /팀 세션|결석으로/ }), { key: 'Escape' });
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: /팀 세션|결석으로/ })).not.toBeInTheDocument(),
  );
  expect(localStorage.getItem(storageKey())).not.toContain('100');
});

it('숨은 홈은 조회·기록하지 않고 활성화 후 한 건을 표시한다', async () => {
  const view = setup(false);
  expect(queries).toBe(0);
  expect(localStorage.getItem(storageKey())).toBeNull();
  view.activate(true);
  await shown();
});

it('홈 복귀 시 이미 본 현재 결과를 건너뛰고 과거 세션 한 건을 안내한다', async () => {
  const view = setup();
  await shown();
  view.activate(false);
  view.activate(true);
  await screen.findByText('2026-11-26 · 과거 팀 세션');
  await waitFor(() => expect(localStorage.getItem(storageKey())).toContain('100'));
});

it('앱 복귀 시 같은 제출자의 새 사진 반려를 다시 안내한다', async () => {
  setup();
  await shown();
  act(() => focusManager.setFocused(false));
  photoId = 204;
  act(() => focusManager.setFocused(true));
  await waitFor(() => expect(localStorage.getItem(storageKey())).toContain('204'));
});

it('조회 중 숨겨진 홈의 늦은 응답은 표시·기록하지 않는다', async () => {
  slow = true;
  const view = setup();
  await waitFor(() => expect(queries).toBe(1));
  view.activate(false);
  await act(async () => {
    await delay(150);
  });
  expect(screen.queryByRole('dialog', { name: /팀 세션|결석으로/ })).not.toBeInTheDocument();
  expect(localStorage.getItem(storageKey())).toBeNull();
});

it('계정 변경은 이전 계정의 시트를 없애고 새 계정에만 별도 기록한다', async () => {
  const view = setup();
  await shown();
  auth.userId = 8;
  view.activate(true);
  await shown();
  expect(localStorage.getItem(storageKey(7))).not.toBeNull();
  expect(localStorage.getItem(storageKey(8))).not.toBeNull();
});

it('사진 조회 실패는 홈을 유지하고 결과를 기록하지 않는다', async () => {
  failed = true;
  const { client } = setup();
  await waitFor(() =>
    expect(
      client
        .getQueryCache()
        .getAll()
        .some((query) => query.state.status === 'error'),
    ).toBe(true),
  );
  expect(screen.getByText('이번 주 세션')).toBeVisible();
  expect(screen.queryByRole('dialog', { name: /팀 세션|결석으로/ })).not.toBeInTheDocument();
  expect(localStorage.getItem(storageKey())).toBeNull();
});

it('재업로드는 닫은 뒤 안내 화면에 해당 세션을 전달하고 기존 이력을 유지한다', async () => {
  setup();
  await shown();
  fireEvent.click(screen.getByRole('button', { name: '다시 업로드하기' }));
  expect(push).toHaveBeenCalledWith('TeamAttendanceGuide', { sessionId: '101' });
  expect(localStorage.getItem(storageKey())).toContain('203');
  expect(screen.queryByRole('dialog', { name: /팀 세션|결석으로/ })).not.toBeInTheDocument();
});

it('결석 문의는 시트를 닫고 기존 운영진 문의 주소로 이동한다', async () => {
  status = 'ABSENT';
  const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
  setup();
  await shown();
  fireEvent.click(screen.getByRole('button', { name: '운영진에게 문의하기' }));
  expect(assign).toHaveBeenCalledWith('https://pf.kakao.com/_aGxofd');
  expect(screen.queryByRole('dialog', { name: /팀 세션|결석으로/ })).not.toBeInTheDocument();
  assign.mockRestore();
});
