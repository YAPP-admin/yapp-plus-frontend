import { createSessionFixtures } from '@/mocks/session-fixtures';
import { createAttendanceFixtures } from '@/mocks/attendance-fixtures';
import { createSessionHandlers, currentWeekFixture } from '@/mocks/session-handlers';
import { createMemberAttendanceHandlers } from '@/mocks/member-attendance-handlers';
import { find6QueryKey, find8Options } from '@yapp-plus/api/generated';
import { getAppBridge } from '@yapp-plus/app-bridge/web';
import type { LocationResult, OpenAppSettingsResult } from '@yapp-plus/app-bridge';
import type { CurrentWeekSessionResponse } from '@yapp-plus/api/generated';
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

const nativeLocation = vi.hoisted(() => ({
  request: vi.fn<() => Promise<LocationResult>>(),
  openSettings: vi.fn<() => Promise<OpenAppSettingsResult>>(),
}));
vi.mock(import('@yapp-plus/app-bridge/web'), async (importOriginal) => ({
  ...(await importOriginal()),
  requestCurrentLocation: nativeLocation.request,
  openAppSettings: nativeLocation.openSettings,
}));
vi.mock('@seed-design/stackflow', () => ({ useActivityZIndexBase: () => 200 }));
vi.mock('@stackflow/react', () => ({ useFlow: () => ({ push: vi.fn<() => void>() }) }));
const weekUrl = `${apiBaseUrl}/api/sessions/current-week`;
const verifyUrl = `${apiBaseUrl}/api/attendance-verifications`;
const week = {
  ...currentWeekFixture,
  session: {
    ...currentWeekFixture.session,
    sessionId: 42,
    attendanceStatus: 'AVAILABLE',
    latitude: 0,
    longitude: 0,
  },
};
const signedIn = {
  status: 'SIGNED_IN' as const,
  reviewTransition: 'NONE' as const,
  session: {
    userId: 1,
    sessionId: 'session-a',
    tokenVersion: 1,
    accessToken: 'test-token',
    expiresAt: 9999999999,
  },
};
const success = { verified: true, checkedInAt: '2026-11-07T05:00:00Z' };
const locationSuccess = {
  status: 'SUCCESS' as const,
  location: {
    latitude: 0,
    longitude: 0,
    accuracy: 10,
    timestamp: 1,
    precision: 'precise' as const,
  },
};
const onComplete = vi.fn<() => void>();
beforeEach(() => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  vi.stubGlobal('ReactNativeWebView', { postMessage: vi.fn<(message: string) => void>() });
  const bridge = getAppBridge();
  vi.spyOn(bridge, 'isNativeMethodAvailable').mockImplementation(
    (method) => method === 'requestCurrentLocation' || method === 'openAppSettings',
  );
  nativeLocation.request.mockReset().mockResolvedValue(locationSuccess);
  nativeLocation.openSettings.mockReset().mockResolvedValue({ status: 'SUCCESS' });
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '위치 확인 후 출석하기' })).toBeEnabled(),
  );
  // happy-dom은 Drawer 전환의 기본 transform을 계산하지 않습니다.
  screen.getByRole('dialog').style.transform = 'none';
  const user = userEvent.setup();
  await user.click(screen.getByRole('textbox', { name: '출석 코드 1번째 자리' }));
  await user.paste(code);
  return user;
}

it('앞자리 0을 붙여넣고 Enter로 실제 코드·인증을 전송한 뒤 홈 완료를 표시한다', async () => {
  const order: string[] = [];
  nativeLocation.request.mockImplementation(() => {
    order.push('location');
    return Promise.resolve(locationSuccess);
  });
  const request = vi.fn<(body: unknown, authorization: string | null) => void>();
  server.use(
    http.post(verifyUrl, async ({ request: req }) => {
      order.push('verify');
      request(await req.json(), req.headers.get('Authorization'));
      server.use(
        http.get(weekUrl, () =>
          HttpResponse.json({
            ...week,
            session: { ...week.session, attendanceStatus: 'CHECKED_IN' },
          }),
        ),
      );
      return HttpResponse.json(success);
    }),
  );
  const view = setup();
  const user = await enter('0000');
  expect(screen.getByRole('textbox', { name: '출석 코드 4번째 자리' })).toHaveValue('0');
  await user.keyboard('{Enter}');
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(order).toEqual(['location', 'verify']);
  expect(request).toHaveBeenCalledWith({ sessionId: 42, code: 0 }, 'Bearer test-token');
  view.close();
  expect(await screen.findByRole('button', { name: '출석했어요!' })).toBeDisabled();
  view.unmount();
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
  setup();
  await enter();
});

it('TEAM 세션으로 코드 화면에 직접 진입해도 위치·출석 요청을 보내지 않는다', async () => {
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(
    http.get(weekUrl, () =>
      HttpResponse.json({ ...week, session: { ...week.session, type: 'TEAM' } }),
    ),
    http.post(verifyUrl, request),
  );
  setup();
  expect(await screen.findByText('현재 출석할 수 있는 세션이 없어요.')).toBeVisible();
  expect(screen.getByRole('button', { name: '위치 확인 후 출석하기' })).toBeDisabled();
  expect(nativeLocation.request).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it('출석 성공 후 서버가 AVAILABLE로 정정하면 홈에서 다시 출석할 수 있다', async () => {
  server.use(http.post(verifyUrl, () => HttpResponse.json(success)));
  const view = setup();
  const user = await enter();
  await user.keyboard('{Enter}');
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  view.close();
  expect(await screen.findByRole('button', { name: '출석하기' })).toBeEnabled();
});

it('위치 메서드를 지원하지 않으면 위치·출석 요청을 보내지 않는다', async () => {
  vi.spyOn(getAppBridge(), 'isNativeMethodAvailable').mockReturnValue(false);
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter();

  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('위치 확인이 가능한 YAPP+ 앱');
  expect(nativeLocation.request).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it('범위 밖 표본은 차단하고 수동 재시도에서 새 표본으로 출석한다', async () => {
  nativeLocation.request
    .mockResolvedValueOnce({
      ...locationSuccess,
      location: { ...locationSuccess.location, latitude: 1 },
    })
    .mockResolvedValueOnce(locationSuccess);
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter();
  const submit = screen.getByRole('button', { name: '위치 확인 후 출석하기' });

  await user.click(submit);
  expect(await screen.findByRole('alert')).toHaveTextContent('100m 이내');
  expect(screen.getByRole('button', { name: '위치 다시 확인' })).toBeEnabled();
  for (const input of screen.getAllByRole('textbox')) {
    expect(input).toHaveAttribute('aria-invalid', 'false');
  }
  expect(request).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '위치 다시 확인' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(nativeLocation.request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenCalledOnce();
});

it('세션 좌표가 없으면 위치 요청 전 제출을 차단한다', async () => {
  server.use(
    http.get(weekUrl, () =>
      HttpResponse.json({ ...week, session: { ...week.session, latitude: null } }),
    ),
  );
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter();

  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('세션 장소 정보');
  expect(nativeLocation.request).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it.each([
  [
    '권한 재요청 가능',
    { status: 'ERROR', code: 'PERMISSION_DENIED', canAskAgain: true } as const,
    '위치 권한을 허용해 주세요.',
    false,
  ],
  [
    '위치 서비스 꺼짐',
    { status: 'ERROR', code: 'SERVICES_DISABLED' } as const,
    '기기 위치 서비스를 켜 주세요.',
    false,
  ],
  ['시간 초과', { status: 'ERROR', code: 'TIMEOUT' } as const, '위치 확인 시간이 지났어요.', false],
  [
    '정확도 부족',
    {
      ...locationSuccess,
      location: { ...locationSuccess.location, accuracy: 50.01 },
    } as const,
    '현재 위치를 정확하게 확인하지 못했어요.',
    false,
  ],
  [
    '정밀 권한 부족',
    {
      ...locationSuccess,
      location: { ...locationSuccess.location, precision: 'approximate' },
    } as const,
    '정확한 위치 권한을 허용해 주세요.',
    true,
  ],
] as const)(
  '%s 사유에 맞는 복구 행동을 표시하고 코드는 유효하게 유지한다',
  async (_, result, message, settings) => {
    nativeLocation.request.mockResolvedValue(result);
    setup();
    const user = await enter();

    await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('button', { name: '앱 설정 열기' }) !== null).toBe(settings);
    expect(screen.getByRole('textbox', { name: '출석 코드 1번째 자리' })).toHaveValue('0');
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).not.toHaveAccessibleDescription(message);
    }
  },
);

it('재요청 불가 권한은 키보드로 설정을 열고 복귀 후 사용자 재시도만 제출한다', async () => {
  nativeLocation.request
    .mockResolvedValueOnce({
      status: 'ERROR',
      code: 'PERMISSION_DENIED',
      canAskAgain: false,
    })
    .mockResolvedValueOnce(locationSuccess);
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter();
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
  const settings = await screen.findByRole('button', { name: '앱 설정 열기' });

  settings.focus();
  await user.keyboard('{Enter}');

  expect(nativeLocation.openSettings).toHaveBeenCalledOnce();
  expect(nativeLocation.request).toHaveBeenCalledOnce();
  expect(request).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '위치 다시 확인' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(nativeLocation.request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenCalledOnce();
});

it('앱 설정 실행 실패를 안내하고 설정 열기 재시도를 유지한다', async () => {
  nativeLocation.request.mockResolvedValue({
    status: 'ERROR',
    code: 'PERMISSION_DENIED',
    canAskAgain: false,
  });
  nativeLocation.openSettings.mockResolvedValue({
    status: 'ERROR',
    code: 'LOCATION_UNAVAILABLE',
  });
  setup();
  const user = await enter();
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));

  await user.click(await screen.findByRole('button', { name: '앱 설정 열기' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('앱 설정을 열지 못했어요.');
  expect(screen.getByRole('button', { name: '앱 설정 열기' })).toBeEnabled();
});

it('위치 확인과 서버 출석 처리 진행 상태를 구분해 알린다', async () => {
  let resolveLocation!: (result: LocationResult) => void;
  const location = new Promise<LocationResult>((resolve) => {
    resolveLocation = resolve;
  });
  let resolveAttendance!: () => void;
  const attendance = new Promise<void>((resolve) => {
    resolveAttendance = resolve;
  });
  nativeLocation.request.mockReturnValue(location);
  server.use(
    http.post(verifyUrl, async () => {
      await attendance;
      return HttpResponse.json(success);
    }),
  );
  setup();
  const user = await enter();

  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
  expect(await screen.findByRole('status')).toHaveTextContent('위치를 확인하고 있어요.');
  expect(screen.getByRole('button', { name: /위치 확인 중/ })).toBeDisabled();

  await act(async () => {
    resolveLocation(locationSuccess);
    await location;
  });
  expect(await screen.findByRole('status')).toHaveTextContent('출석을 처리하고 있어요.');
  expect(screen.getByRole('button', { name: /출석 처리 중/ })).toBeDisabled();

  await act(async () => {
    resolveAttendance();
    await attendance;
  });
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it('네 자리 입력 검증은 제출 후 시작하고 수정 즉시 해제한다', async () => {
  const request = vi.fn<() => Response>(() => HttpResponse.json(success));
  server.use(http.post(verifyUrl, request));
  setup();
  const user = await enter('123');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
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
  expect(await screen.findByRole('heading', { name: '세션을 불러오지 못했어요' })).toBeVisible();
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
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
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
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
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
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
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
    expect(screen.getByRole('button', { name: '위치 확인 후 출석하기' })).toBeDisabled();
  },
);

it.each([
  ['CHECKED_IN', '출석했어요!'],
  ['PENDING_APPROVAL', '인증 사진 검토 중'],
] as const)('서버 상태 %s에서는 완료 상태를 표시한다', async (attendanceStatus, label) => {
  server.use(
    http.get(weekUrl, () =>
      HttpResponse.json({ ...week, session: { ...week.session, attendanceStatus } }),
    ),
  );
  const { close } = setup();
  close();
  expect(await screen.findByRole('button', { name: label })).toBeDisabled();
});

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
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
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
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('인터넷 연결');
  expect(nativeLocation.request).not.toHaveBeenCalled();
  act(() => onlineManager.setOnline(true));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '위치 확인 후 출석하기' })).toBeEnabled(),
  );
  expect(request).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '위치 확인 후 출석하기' }));
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
});

it('세션이 없었다가 조회되면 현재 세션으로 제출할 수 있다', async () => {
  server.use(http.get(weekUrl, () => HttpResponse.json({ ...week, session: null })));
  const view = setup();
  expect(await screen.findByText('현재 출석할 수 있는 세션이 없어요.')).toBeVisible();
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
  act(() => {
    view.client.setQueryData(find6QueryKey(), week);
  });
  await enter();
  expect(screen.getByRole('button', { name: '위치 확인 후 출석하기' })).toBeEnabled();
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
        if (boundary === '화면 제거') {
          server.use(
            http.get(weekUrl, () =>
              HttpResponse.json({
                ...week,
                session: { ...week.session, attendanceStatus: 'CHECKED_IN' },
              }),
            ),
          );
        }
        return boundary === '오류 후 닫기'
          ? HttpResponse.json({ code: 'INVALID_ATTENDANCE_CODE' }, { status: 400 })
          : HttpResponse.json(success);
      }),
    );
    const view = setup();
    const user = await enter();
    const submit = screen.getByRole('button', { name: '위치 확인 후 출석하기' });
    fireEvent.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    fireEvent.click(submit);
    await waitFor(() => expect(received).toHaveBeenCalledOnce());
    expect(nativeLocation.request).toHaveBeenCalledOnce();
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
  const currentWeekWithLocation: CurrentWeekSessionResponse = {
    ...fixtures.currentWeekFixture,
    session: fixtures.currentWeekFixture.session
      ? { ...fixtures.currentWeekFixture.session, latitude: 0, longitude: 0 }
      : null,
  };
  const attendance = createAttendanceFixtures(fixtures);
  server.use(
    ...createSessionHandlers(
      apiBaseUrl,
      undefined,
      { ...fixtures, currentWeekFixture: currentWeekWithLocation },
      attendance,
    ),
    ...createMemberAttendanceHandlers(apiBaseUrl, undefined, undefined, attendance),
  );
  const view = setup();
  const options = { ...find8Options(), staleTime: Infinity };
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
