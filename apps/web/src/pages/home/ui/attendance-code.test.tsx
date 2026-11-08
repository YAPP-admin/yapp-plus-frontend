import type { AuthResult } from '@yapp-plus/app-bridge';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { createAppQueryClient } from '@/app/providers';
import { http, HttpResponse } from 'msw';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { AttendanceCodeSheet } from './home-demo-sheets';
import { CurrentWeekCard } from './current-week-card';

vi.mock('@seed-design/stackflow', () => ({ useActivityZIndexBase: () => 200 }));
vi.mock('@stackflow/react', () => ({ useFlow: () => ({ push: vi.fn<() => void>() }) }));
const weekUrl = `${apiBaseUrl}/api/sessions/current-week`;
const verifyUrl = `${apiBaseUrl}/api/attendance-verifications`;
const week = {
  ...currentWeekFixture,
  session: { ...currentWeekFixture.session, sessionId: 42, attendanceStatus: 'AVAILABLE' },
};
const signedIn = {
  status: 'SIGNED_IN' as const,
  session: {
    userId: 1,
    sessionId: 'session-a',
    tokenVersion: 1,
    accessToken: 'test-token',
    expiresAt: 9999999999,
  },
};
const success = { verified: true, checkedInAt: '2026-11-07T05:00:00Z' };
const onComplete = vi.fn<() => void>();
beforeEach(() => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  onComplete.mockReset();
  onlineManager.setOnline(true);
});
function setup() {
  const client = createAppQueryClient();
  client.setQueryData(nativeSessionQueryOptions(true).queryKey, signedIn);
  const tree = (open = true, active = true) => (
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        {open ? <AttendanceCodeSheet open={active} onComplete={onComplete} /> : <CurrentWeekCard />}
      </NativeAuthSessionProvider>
    </QueryClientProvider>
  );
  const view = render(tree());
  return {
    client,
    ...view,
    close: () => view.rerender(tree(false)),
    hide: () => view.rerender(tree(true, false)),
  };
}
async function enter(code = '0123') {
  await waitFor(() => expect(screen.getByRole('button', { name: '확인' })).toBeEnabled());
  const user = userEvent.setup();
  await user.click(screen.getByRole('textbox', { name: '출석 코드 1번째 자리' }));
  await user.paste(code);
  return user;
}

it('앞자리 0을 붙여넣고 Enter로 실제 코드·인증을 전송한 뒤 홈 완료를 표시한다', async () => {
  const request = vi.fn<(body: unknown, authorization: string | null) => void>();
  server.use(
    http.post(verifyUrl, async ({ request: req }) => {
      request(await req.json(), req.headers.get('Authorization'));
      return HttpResponse.json(success);
    }),
  );
  const view = setup();
  const user = await enter('0000');
  expect(screen.getByRole('textbox', { name: '출석 코드 4번째 자리' })).toHaveValue('0');
  await user.keyboard('{Enter}');
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(request).toHaveBeenCalledWith({ sessionId: 42, code: 0 }, 'Bearer test-token');
  view.close();
  expect(await screen.findByRole('button', { name: '출석했어요!' })).toBeDisabled();
  view.unmount();
  setup();
  await enter();
});

it('네 자리 입력 검증은 제출 후 시작하고 수정 즉시 해제한다', async () => {
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter('123');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('출석 코드 네 자리를 입력해 주세요.');
  expect(request).not.toHaveBeenCalled();
  const last = screen.getByRole('textbox', { name: '출석 코드 4번째 자리' });
  await user.click(last);
  await user.type(last, 'a4');
  expect(last).toHaveValue('4');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.keyboard('{Enter}');
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it('최초 조회 대기와 오류를 시트 안에 표시하고 재시도로 입력을 연다', async () => {
  let respond!: () => void;
  const response = new Promise<void>((resolve) => {
    respond = resolve;
  });
  server.use(
    http.get(weekUrl, async () => {
      await response;
      return HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 400 });
    }),
  );
  setup();
  expect(await screen.findByText('세션을 불러오고 있어요…')).toBeVisible();
  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await act(async () => {
    respond();
    await response;
  });
  expect(await screen.findByRole('alert')).toHaveTextContent('세션을 불러오지 못했어요.');
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
  await userEvent.click(screen.getByRole('button', { name: '세션 다시 확인' }));
  await enter();
  expect(screen.getAllByRole('textbox')).toHaveLength(4);
});

it('코드 오류 후 입력을 유지하고 수정하여 수동 재제출한다', async () => {
  server.use(
    http.post(verifyUrl, () =>
      HttpResponse.json({ code: 'INVALID_ATTENDANCE_CODE' }, { status: 400 }),
    ),
  );
  setup();
  const user = await enter();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('출석 코드가 올바르지 않아요.');
  expect(screen.getByRole('textbox', { name: '출석 코드 1번째 자리' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  expect(onComplete).not.toHaveBeenCalled();
  server.use(http.post(verifyUrl, () => HttpResponse.json(success)));
  fireEvent.change(screen.getByRole('textbox', { name: '출석 코드 4번째 자리' }), {
    target: { value: '4' },
  });
  await user.click(screen.getByRole('button', { name: '확인' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it.each([
  [
    '검증 실패',
    HttpResponse.json({ ...success, verified: false }),
    '출석 결과를 확인하지 못했어요',
  ],
  [
    '잘못된 시각',
    HttpResponse.json({ ...success, checkedInAt: 'invalid' }),
    '출석 결과를 확인하지 못했어요',
  ],
  ['응답 유실', HttpResponse.error(), '출석 결과를 확인하지 못했어요'],
  [
    '인증 만료',
    HttpResponse.json({ code: 'AUTHENTICATION_FAILED' }, { status: 401 }),
    '인증이 만료됐어요',
  ],
] as const)('%s에서는 완료·자동 재전송 없이 복구를 안내한다', async (_, response, message) => {
  const request = vi.fn<() => typeof response>(() => response);
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(onComplete).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledOnce();
});

it.each(['NOT_OPEN', 'NOT_ELIGIBLE'])(
  '직접 진입해도 %s에서는 제출하지 않는다',
  async (attendanceStatus) => {
    server.use(
      http.get(weekUrl, () =>
        HttpResponse.json({ ...week, session: { ...week.session, attendanceStatus } }),
      ),
    );
    setup();
    expect(await screen.findByText('현재 출석할 수 있는 세션이 없어요.')).toBeVisible();
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  },
);

it('입력 후 서버 대상이 달라지면 코드를 새 세션으로 보내지 않는다', async () => {
  const request = vi.fn<() => void>();
  server.use(
    http.post(verifyUrl, () => {
      request();
      return HttpResponse.json(success);
    }),
  );
  setup();
  const user = await enter();
  server.use(
    http.get(weekUrl, () =>
      HttpResponse.json({ ...week, session: { ...week.session, sessionId: 43 } }),
    ),
  );
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('세션이 변경됐어요');
  expect(request).not.toHaveBeenCalled();
  expect(onComplete).not.toHaveBeenCalled();
});

it('오프라인 제출은 연결 복구 후에도 자동으로 전송하지 않는다', async () => {
  const request = vi.fn<() => void>();
  server.use(
    http.post(verifyUrl, () => {
      request();
      return HttpResponse.json(success);
    }),
  );
  setup();
  const user = await enter();
  act(() => onlineManager.setOnline(false));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('인터넷 연결');
  act(() => onlineManager.setOnline(true));
  await user.click(screen.getByRole('button', { name: '세션 다시 확인' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '확인' })).toBeEnabled());
  expect(request).not.toHaveBeenCalled();
});

it.each(['화면 이탈', '화면 숨김', '계정 변경'])(
  '%s 뒤 지연 성공은 강제 이동 없이 같은 계정에만 기록한다',
  async (boundary) => {
    const received = vi.fn<() => void>();
    let finish!: () => void;
    const response = new Promise<void>((resolve) => {
      finish = resolve;
    });
    server.use(
      http.post(verifyUrl, async () => {
        received();
        await response;
        return HttpResponse.json(success);
      }),
    );
    const view = setup();
    await enter();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    await waitFor(() => expect(received).toHaveBeenCalledOnce());
    if (boundary === '화면 이탈') {
      view.close();
    } else if (boundary === '화면 숨김') {
      view.hide();
    } else {
      act(() => {
        const other: AuthResult = {
          ...signedIn,
          session: { ...signedIn.session, userId: 2, sessionId: 'session-b' },
        };
        view.client.setQueryData(nativeSessionQueryOptions(true).queryKey, other);
      });
    }
    await act(async () => {
      finish();
      await response;
    });
    await waitFor(() => expect(view.client.isMutating()).toBe(0));
    expect(onComplete).not.toHaveBeenCalled();
    view.close();
    const changed = boundary === '계정 변경';
    const button = await screen.findByRole('button', {
      name: changed ? '출석하기' : '출석했어요!',
    });
    expect(button).toHaveProperty('disabled', !changed);
  },
);
