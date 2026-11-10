import type { AuthResult } from '@yapp-plus/app-bridge';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/providers';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { mineQueryKey, type UserProfileResponse } from '@yapp-plus/api/generated';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { apiBaseUrl, server } from '../../../mocks/server';
import {
  createMemberAttendanceHandlers,
  scoreFixture,
} from '../../../mocks/member-attendance-handlers';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MyPage } from './my-page';

vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    activityName: _activityName,
    activityParams: _activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName?: string;
    activityParams?: object;
  }) => (
    <a {...props} href="/my/attendance">
      {children}
    </a>
  ),
}));

const scoreUrl = `${apiBaseUrl}/api/attendance-scores/me`;
const profileUrl = `${apiBaseUrl}/api/users/me`;
beforeEach(() => vi.stubEnv('VITE_API_MOCKING', 'true'));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function renderPage(native = false, name?: string) {
  const client = createAppQueryClient();
  if (native) {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
    const result = {
      status: 'SIGNED_IN',
      session: {
        userId: 1,
        sessionId: 'test-session',
        tokenVersion: 1,
        accessToken: 'test-token',
        expiresAt: 9999999999,
        name,
      },
    } satisfies AuthResult;
    client.setQueryData(nativeSessionQueryOptions(true).queryKey, result);
  }
  render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <MyPage />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
  return { client };
}

describe('MyPage', () => {
  it('세션 이름 대신 API 프로필과 소속 정보를 표시한다', async () => {
    renderPage(true, '세션에만 있는 이름');
    expect(await screen.findByText('테스트 회원')).toBeVisible();
    expect(await screen.findByText('92점')).toBeVisible();
    expect(screen.queryByText('세션에만 있는 이름')).not.toBeInTheDocument();
    expect(screen.getByText('활동회원')).toBeVisible();
    expect(screen.getByText('28기')).toBeVisible();
    expect(screen.getByText('Web')).toBeVisible();
    expect(screen.getByRole('img', { name: '프로필' })).toBeVisible();
  });

  it('소속 정보가 없는 프로필도 이름과 출석 현황을 표시한다', async () => {
    server.use(
      http.get(scoreUrl, () =>
        HttpResponse.json({
          ...scoreFixture,
          totalScore: 0,
          attendanceCount: 0,
          lateCount: 0,
          absentCount: 0,
        }),
      ),
      http.get(profileUrl, () =>
        HttpResponse.json({
          userId: 1,
          name: '소속 없는 회원',
          membershipStatus: null,
          generationId: null,
          generationNumber: null,
          position: null,
        } satisfies UserProfileResponse),
      ),
    );
    renderPage(true);
    expect(await screen.findByText('0점')).toBeVisible();
    expect(within(screen.getByLabelText('내 출석 현황')).getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('소속 없는 회원')).toBeVisible();
    expect(screen.getAllByText('—')).toHaveLength(4);
  });

  it('프로필을 불러오는 동안에도 출석·메뉴·규칙을 유지한다', async () => {
    let finish: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    server.use(
      http.get(profileUrl, async () => {
        await pending;
        return HttpResponse.json({
          userId: 1,
          name: '늦게 도착한 회원',
          membershipStatus: 'PLAYER',
          generationId: 28,
          generationNumber: 28,
          position: 'WEB',
        } satisfies UserProfileResponse);
      }),
    );
    renderPage(true, '세션 이름');
    expect(await screen.findByRole('status')).toHaveTextContent('프로필을 불러오는 중이에요');
    expect(await screen.findByText('92점')).toBeVisible();
    expect(screen.getByRole('link', { name: '출석 내역' })).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: '출석 규칙 안내' }));
    expect(await screen.findByRole('dialog', { name: '출석 규칙' })).toBeVisible();
    act(() => finish?.());
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: '출석 규칙' })).toBeVisible();
    await userEvent.setup().click(
      within(screen.getByRole('dialog', { name: '출석 규칙' })).getByRole('button', {
        name: '확인',
      }),
    );
    expect(await screen.findByText('늦게 도착한 회원')).toBeVisible();
  });

  it.each(['ineligible', 'no-generation'])(
    '미대상은 —이고 오류 안내가 없다 (%s)',
    async (state) => {
      server.use(...createMemberAttendanceHandlers(apiBaseUrl, state));
      const { client } = renderPage();
      await waitFor(() =>
        expect(client.getQueryData(mineQueryKey())).toMatchObject({ status: 'unavailable' }),
      );
      expect(screen.getAllByText('—')).toHaveLength(9);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('초기 실패에서도 메뉴를 유지하고 키보드 재시도로 복구한다', async () => {
    server.use(...createMemberAttendanceHandlers(apiBaseUrl, 'error'));
    renderPage(true, '테스트 회원');
    expect(await screen.findByRole('alert')).toHaveTextContent('출석 현황을 불러오지 못했어요');
    expect(screen.getByText('테스트 회원')).toBeVisible();
    expect(screen.getByRole('button', { name: '출석 규칙 안내' })).toBeVisible();
    expect(screen.getByRole('link', { name: '출석 내역' })).toBeVisible();
    const retry = screen.getByRole('button', { name: '다시 시도' });
    retry.focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(await screen.findByText('92점')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('재조회 실패는 이전 값과 오류 안내를 함께 표시한다', async () => {
    const { client } = renderPage();
    expect(await screen.findByText('92점')).toBeVisible();
    server.use(http.get(scoreUrl, () => HttpResponse.json({}, { status: 500 })));
    await act(() => client.invalidateQueries({ queryKey: mineQueryKey() }));
    expect(await screen.findByRole('alert')).toHaveTextContent('이전 내용을 표시하고 있어요');
    expect(screen.getByText('92점')).toBeVisible();
    server.use(...createMemberAttendanceHandlers(apiBaseUrl));
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByText('92점')).toBeVisible();
  });

  it('MSW 없는 일반 브라우저에서는 프로필·출석 요청 없이 로그인 안내를 표시한다', async () => {
    vi.stubEnv('VITE_API_MOCKING', 'false');
    const scoreRequested = vi.fn<() => Response>(() => HttpResponse.json(scoreFixture));
    const profileRequested = vi.fn<() => Response>(() => HttpResponse.json({}));
    server.use(http.get(scoreUrl, scoreRequested), http.get(profileUrl, profileRequested));
    renderPage();
    expect(await screen.findByRole('status')).toHaveTextContent('앱에 로그인한 후');
    expect(scoreRequested).not.toHaveBeenCalled();
    expect(profileRequested).not.toHaveBeenCalled();
  });

  it.each([
    ['409 응답', () => HttpResponse.json({}, { status: 409 })],
    ['503 응답', () => HttpResponse.json({}, { status: 503 })],
    ['네트워크 오류', () => HttpResponse.error()],
  ])('프로필 %s에도 출석과 메뉴를 유지하고 재시도로 복구한다', async (_label, failure) => {
    server.use(http.get(profileUrl, failure));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage(true);
    expect(await screen.findByRole('alert')).toHaveTextContent('프로필을 불러오지 못했어요');
    expect(screen.getByText('92점')).toBeVisible();
    expect(screen.getByRole('link', { name: '출석 내역' })).toBeVisible();
    expect(screen.getByRole('button', { name: '출석 규칙 안내' })).toBeVisible();
    server.use(
      http.get(profileUrl, () =>
        HttpResponse.json({
          userId: 1,
          name: '재시도 회원',
          membershipStatus: 'OB',
          generationId: 28,
          generationNumber: 28,
          position: 'IOS',
        } satisfies UserProfileResponse),
      ),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: '프로필 다시 시도' }));
    expect(await screen.findByText('재시도 회원')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('출석 내역 메뉴 링크를 렌더링한다', async () => {
    renderPage();
    const menuNav = within(await screen.findByRole('navigation', { name: '마이페이지 메뉴' }));
    const attendanceLink = menuNav.getByRole('link', { name: /출석 내역/ });
    expect(attendanceLink).toHaveAttribute('href', '/my/attendance');
  });

  it('출석 현황 카드의 ? 버튼을 누르면 SEED 출석 규칙 다이얼로그가 열리고 확인 버튼으로 닫힌다', async () => {
    renderPage();
    const questionBtn = await screen.findByRole('button', { name: '출석 규칙 안내' });
    expect(screen.queryByRole('heading', { name: '출석 규칙' })).not.toBeInTheDocument();

    questionBtn.click();

    const heading = await screen.findByRole('heading', { name: '출석 규칙' });
    expect(heading).toBeInTheDocument();

    const dialog = screen.getByRole('dialog', { name: '출석 규칙' });
    // 페이지 레이아웃에 가려지지 않도록 페이지 밖에 렌더링합니다.
    expect(dialog.closest('main')).toBeNull();
    expect(within(dialog).getByText('1시간 지각/조퇴')).toBeInTheDocument();
    expect(within(dialog).getByText('-4점')).toBeInTheDocument();
    expect(within(dialog).getByText('결석')).toBeInTheDocument();
    expect(within(dialog).getByText('-12점')).toBeInTheDocument();
    expect(within(dialog).getByText(/총 40점 미만의 회원은/)).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole('button', { name: '확인' });
    confirmBtn.click();

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '출석 규칙' })).not.toBeInTheDocument();
    });
  });
});
