/** 사전 출결 보고 모델의 입력·마감·요청·오류 경계를 검증합니다. */
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import {
  currentWeekOptions,
  type CurrentWeekAttendanceReportResponse,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekQueryOptions } from './current-week-query';
import {
  attendanceReportInputSchema,
  isAttendanceReportOpen,
  useAttendanceReport,
} from './attendance-report';

const apiOptions = { auth: 'test-token', baseUrl: apiBaseUrl, retry: 0 };
const auth = { apiOptions, isNative: true };
const onComplete = vi.fn<() => void>();
const session = {
  ...currentWeekFixture.session,
  date: '2026-11-07',
  startTime: '13:30:00',
};
const currentWeek = { ...currentWeekFixture, session };
const reportUrl = `${apiBaseUrl}/api/attendance-reports`;

vi.mock('@/features/auth', () => ({
  useNativeAuthSession: () => auth,
}));

function setup(
  now = '2026-11-07T04:29:59.999Z',
  report: CurrentWeekAttendanceReportResponse = {
    reportId: null,
    types: [],
    type: null,
    reason: null,
    submittedAt: null,
  },
) {
  vi.setSystemTime(new Date(now));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(currentWeekQueryOptions(apiOptions).queryKey, currentWeek);
  client.setQueryData(currentWeekOptions(apiOptions).queryKey, report);
  const hook = renderHook(() => useAttendanceReport(onComplete), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  onComplete.mockReset();
  onlineManager.setOnline(true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  onlineManager.setOnline(true);
  auth.isNative = true;
});

it('사유는 코드포인트 2~30자를 검사하고 원문을 보존한다', () => {
  expect(attendanceReportInputSchema.parse({ types: ['LATE'], reason: ' 병원 예약 ' })).toEqual({
    types: ['LATE'],
    reason: ' 병원 예약 ',
  });
  for (const [reason, valid] of [
    ['', false],
    ['   ', false],
    ['가', false],
    ['가나', true],
    ['😀'.repeat(30), true],
    ['가'.repeat(31), false],
  ] as const) {
    expect(attendanceReportInputSchema.safeParse({ types: ['LATE'], reason }).success).toBe(valid);
  }
});

it('지각·조퇴만 함께 선택하고 결석 혼합·중복·미선택을 거절한다', () => {
  for (const [types, valid] of [
    [['LATE', 'EARLY_LEAVE'], true],
    [['ABSENT'], true],
    [[], false],
    [['ABSENT', 'LATE'], false],
    [['LATE', 'LATE'], false],
  ] as const) {
    expect(attendanceReportInputSchema.safeParse({ types, reason: '개인 사정' }).success).toBe(
      valid,
    );
  }
});

it('한국 시간 세션 시작 직전에는 열리고 정각부터 닫힌다', () => {
  expect(isAttendanceReportOpen(session, Date.parse('2026-11-07T04:29:59.999Z'))).toBe(true);
  expect(isAttendanceReportOpen(session, Date.parse('2026-11-07T04:30:00Z'))).toBe(false);
  expect(isAttendanceReportOpen(null, Date.parse('2026-11-07T04:29:59.999Z'))).toBe(false);
});

it.each([200, 404])(
  '기존 보고는 재조회 후에도 최초 보고 ID로 수정하고 %s 응답을 처리한다',
  async (status) => {
    const put = vi.fn<(body: unknown) => void>();
    const post = vi.fn<() => void>();
    server.use(
      http.post(reportUrl, post),
      http.put(`${reportUrl}/42`, async ({ request }) => {
        put(await request.json());
        return HttpResponse.json(
          status === 200
            ? { reportId: 42, sessionId: 1, submittedAt: '2026-11-07T04:00:00Z' }
            : { code: 'ATTENDANCE_REPORT_NOT_FOUND' },
          { status },
        );
      }),
    );
    const { result, client } = setup(undefined, {
      reportId: 42,
      types: ['LATE', 'EARLY_LEAVE'],
      type: 'LATE',
      reason: null,
      submittedAt: '2026-11-07T04:00:00Z',
    });
    expect(result.current.initialValues).toEqual({ types: ['LATE', 'EARLY_LEAVE'], reason: '' });
    act(() => {
      client.setQueryData(currentWeekOptions(apiOptions).queryKey, {
        reportId: null,
        types: [],
        type: null,
        reason: null,
        submittedAt: null,
      });
    });
    act(() => {
      result.current.submit({ types: ['LATE', 'EARLY_LEAVE'], reason: ' 개인 일정 ' });
    });
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith({ types: ['LATE', 'EARLY_LEAVE'], reason: ' 개인 일정 ' }),
    );
    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(onComplete).toHaveBeenCalledTimes(status === 200 ? 1 : 0);
    expect(result.current.error).toBe(
      status === 200 ? '' : '수정할 보고를 찾지 못했어요. 보고를 다시 열어 확인해 주세요.',
    );
    expect(post).not.toHaveBeenCalled();
  },
);

it('유효한 보고는 sessionId 없이 한 번 제출하고 성공 뒤 주간 Query를 무효화한다', async () => {
  const request = vi.fn<(body: unknown, authorization: string | null) => void>();
  server.use(
    http.post(reportUrl, async ({ request: incoming }) => {
      request(await incoming.json(), incoming.headers.get('Authorization'));
      return HttpResponse.json({ sessionId: -1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 });
    }),
  );
  const { result, client } = setup();
  const invalidateQueries = vi.spyOn(client, 'invalidateQueries');

  act(() => {
    result.current.submit({ types: ['LATE'], reason: ' 병원 예약 ' });
  });

  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(request).toHaveBeenCalledWith(
    { types: ['LATE'], reason: ' 병원 예약 ' },
    'Bearer test-token',
  );
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: currentWeekQueryOptions(apiOptions).queryKey,
  });
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: currentWeekOptions(apiOptions).queryKey,
  });
});

it.each([
  ['입력 오류', 400, 'INVALID_ATTENDANCE_REPORT', '입력한 내용을 확인해 주세요.'],
  ['자격 없음', 403, 'ATTENDANCE_REPORT_NOT_ELIGIBLE', '사전 출결 보고 대상이 아니에요.'],
  [
    '대상 없음',
    404,
    'ATTENDANCE_SESSION_NOT_FOUND',
    '보고할 세션을 찾지 못했어요. 세션을 다시 확인해 주세요.',
  ],
  ['보고 불가', 409, 'ATTENDANCE_REPORT_UNAVAILABLE', '지금은 사전 출결 보고를 할 수 없어요.'],
  [
    '생성 중복',
    409,
    'ATTENDANCE_REPORT_ALREADY_EXISTS',
    '이미 제출한 보고가 있어요. 보고를 다시 열어 확인해 주세요.',
  ],
] as const)('%s 응답은 완료 없이 복구 안내를 남긴다', async (_, status, code, message) => {
  const request = vi.fn<() => Response>(() => HttpResponse.json({ code }, { status }));
  server.use(http.post(reportUrl, request));
  const { result } = setup();

  act(() => {
    result.current.submit({ types: ['ABSENT'], reason: '개인 사정' });
  });

  await waitFor(() => expect(result.current.error).toBe(message));
  expect(onComplete).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledOnce();
});

it('정각 이후와 오프라인에서는 요청하지 않고 안내를 반환한다', () => {
  const request = vi.fn<() => Response>(() =>
    HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 }),
  );
  server.use(http.post(reportUrl, request));
  const closed = setup('2026-11-07T04:30:00Z');

  let closedMessage: string | undefined;
  act(() => {
    closedMessage = closed.result.current.submit({ types: ['EARLY_LEAVE'], reason: '병원 방문' });
  });

  expect(request).not.toHaveBeenCalled();
  expect(closedMessage).toBe('현재는 사전 출결 보고를 할 수 없어요.');
  expect(closed.result.current.error).toBe('');
  closed.unmount();

  const online = setup();
  onlineManager.setOnline(false);
  let offlineMessage: string | undefined;
  act(() => {
    offlineMessage = online.result.current.submit({ types: ['EARLY_LEAVE'], reason: '병원 방문' });
  });

  expect(offlineMessage).toBe('인터넷 연결을 확인한 뒤 다시 제출해 주세요.');
  expect(online.result.current.error).toBe('');
  expect(request).not.toHaveBeenCalled();
});

it('일반 브라우저에서는 실제 보고 요청을 보내지 않고 안내를 반환한다', () => {
  const request = vi.fn<() => Response>(() =>
    HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 }),
  );
  server.use(http.post(reportUrl, request));
  auth.isNative = false;
  const { result } = setup();

  let message: string | undefined;
  act(() => {
    message = result.current.submit({ types: ['LATE'], reason: '교통 지연' });
  });

  expect(message).toBe('현재는 사전 출결 보고를 할 수 없어요.');
  expect(result.current.error).toBe('');
  expect(request).not.toHaveBeenCalled();
});

it('제출 중에는 같은 보고를 다시 전송하지 않는다', async () => {
  let respond!: () => void;
  const response = new Promise<void>((resolve) => {
    respond = resolve;
  });
  const request = vi.fn<() => Promise<Response>>(async () => {
    await response;
    return HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 });
  });
  server.use(http.post(reportUrl, request));
  const { result } = setup();

  act(() => {
    result.current.submit({ types: ['LATE'], reason: '교통 지연' });
  });
  await waitFor(() => expect(result.current.pending).toBe(true));
  act(() => {
    result.current.submit({ types: ['LATE'], reason: '교통 지연' });
  });
  expect(request).toHaveBeenCalledOnce();

  await act(async () => {
    respond();
    await response;
  });
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it('화면 이탈 뒤 늦게 도착한 성공은 완료 콜백을 실행하지 않는다', async () => {
  let respond!: () => void;
  const response = new Promise<void>((resolve) => {
    respond = resolve;
  });
  server.use(
    http.post(reportUrl, async () => {
      await response;
      return HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 });
    }),
  );
  const hook = setup();

  act(() => {
    hook.result.current.submit({ types: ['LATE'], reason: '교통 지연' });
  });
  await waitFor(() => expect(hook.result.current.pending).toBe(true));
  hook.unmount();

  await act(async () => {
    respond();
    await response;
  });
  expect(onComplete).not.toHaveBeenCalled();
});
