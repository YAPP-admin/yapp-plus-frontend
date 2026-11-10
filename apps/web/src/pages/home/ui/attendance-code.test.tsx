import { createSessionFixtures } from '@/mocks/session-fixtures';
import { createAttendanceFixtures } from '@/mocks/attendance-fixtures';
import { createSessionHandlers, currentWeekFixture } from '@/mocks/session-handlers';
import { createMemberAttendanceHandlers } from '@/mocks/member-attendance-handlers';
import { find4QueryKey, find6Options } from '@yapp-plus/api/generated';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { createAppQueryClient } from '@/app/providers';
import { http, HttpResponse } from 'msw';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';
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
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const client = createAppQueryClient();
  client.setQueryData(nativeSessionQueryOptions(true).queryKey, signedIn);
  const tree = (open = true) => (
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        {open ? (
          <AttendanceCodeSheet open onComplete={onComplete} onOpenChange={onOpenChange} />
        ) : (
          <CurrentWeekCard />
        )}
      </NativeAuthSessionProvider>
    </QueryClientProvider>
  );
  const view = render(tree());
  return {
    client,
    ...view,
    close: () => view.rerender(tree(false)),
    onOpenChange,
  };
}
async function enter(code = '0123') {
  await waitFor(() => expect(screen.getByRole('button', { name: '확인' })).toBeEnabled());
  // happy-dom은 Drawer 전환의 기본 transform을 계산하지 않습니다.
  screen.getByRole('dialog').style.transform = 'none';
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

it.each([
  ['ATTENDANCE_SESSION_NOT_FOUND', 404, '출석할 세션을 찾지 못했어요.'],
  ['ATTENDANCE_UNAVAILABLE', 409, '지금은 출석할 수 없어요.'],
] as const)('추가 GET 없이 제출하고 서버의 %s 거절을 표시한다', async (code, status, message) => {
  const lookup = vi.fn<() => Response>(() => HttpResponse.json(week));
  const request = vi.fn<(body: unknown) => void>();
  server.use(
    http.get(weekUrl, lookup),
    http.post(verifyUrl, async ({ request: req }) => {
      request(await req.json());
      return HttpResponse.json({ code }, { status });
    }),
  );
  setup();
  const user = await enter();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(lookup).toHaveBeenCalledOnce();
  expect(request).toHaveBeenCalledExactlyOnceWith({ sessionId: 42, code: 123 });
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

it('세션이 없었다가 조회되면 현재 세션으로 제출할 수 있다', async () => {
  server.use(http.get(weekUrl, () => HttpResponse.json({ ...week, session: null })));
  const view = setup();
  expect(await screen.findByText('현재 출석할 수 있는 세션이 없어요.')).toBeVisible();
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
  act(() => {
    view.client.setQueryData(find4QueryKey(), week);
  });
  await enter();
  expect(screen.getByRole('button', { name: '확인' })).toBeEnabled();
});

it.each(['오류 후 닫기', '화면 제거'])(
  '제출 중 입력·닫기·중복 제출을 막고 %s를 처리한다',
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
        return boundary === '오류 후 닫기'
          ? HttpResponse.json({ code: 'INVALID_ATTENDANCE_CODE' }, { status: 400 })
          : HttpResponse.json(success);
      }),
    );
    const view = setup();
    const user = await enter();
    const submit = screen.getByRole('button', { name: '확인' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(received).toHaveBeenCalledOnce());
    expect(submit).toBeDisabled();
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toBeDisabled();
    }
    await user.keyboard('{Escape}');
    expect(view.onOpenChange).not.toHaveBeenCalled();
    const removed = boundary === '화면 제거';
    if (removed) {
      view.close();
    }
    await act(async () => {
      finish();
      await response;
    });
    const result = removed ? '출석했어요!' : '출석 코드가 올바르지 않아요.';
    expect(await screen.findByText(result)).toBeVisible();
    await user.keyboard('{Escape}');
    expect(view.onOpenChange.mock.calls[0]?.[0]).toBe(removed ? undefined : false);
    expect(onComplete).not.toHaveBeenCalled();
  },
);

it('목업 출석 성공은 홈 완료 표시와 이미 조회한 출석 내역을 함께 갱신한다', async () => {
  const fixtures = createSessionFixtures(Date.parse('2026-11-07T13:30:00+09:00'));
  const attendance = createAttendanceFixtures(fixtures);
  server.use(
    ...createSessionHandlers(apiBaseUrl, undefined, fixtures, attendance),
    ...createMemberAttendanceHandlers(apiBaseUrl, undefined, undefined, attendance),
  );
  const view = setup();
  const options = { ...find6Options(), staleTime: Infinity };
  const before = await view.client.fetchQuery(options);
  expect(before.items.find(({ sessionId }) => sessionId === 39902)?.attendanceStatus).toBe(
    'UNDECIDED',
  );
  const user = await enter('1234');
  await user.keyboard('{Enter}');
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  view.close();
  expect(await screen.findByRole('button', { name: '출석했어요!' })).toBeDisabled();
  const after = await view.client.fetchQuery(options);
  expect(after.items.find(({ sessionId }) => sessionId === 39902)?.attendanceStatus).toBe(
    'PRESENT',
  );
});
