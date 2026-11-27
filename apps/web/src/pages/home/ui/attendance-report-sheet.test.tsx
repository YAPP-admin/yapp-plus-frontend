/** 사전 출결 보고 시트의 단계·입력·제출 UI를 검증합니다. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { createAppQueryClient } from '@/app/providers';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AttendanceReportSheet, type AttendanceReportStep } from './attendance-report-sheet';

vi.mock('@seed-design/stackflow', () => ({ useActivityZIndexBase: () => 200 }));

const reportUrl = `${apiBaseUrl}/api/attendance-reports`;
const weekUrl = `${apiBaseUrl}/api/sessions/current-week`;
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
const week = {
  ...currentWeekFixture,
  session: {
    ...currentWeekFixture.session,
    date: '2026-11-07',
    startTime: '13:30:00',
  },
};
const onComplete = vi.fn<() => void>();

function SheetFlow({
  onOpenChange = vi.fn<(open: boolean) => void>(),
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [step, setStep] = useState<AttendanceReportStep>('type');
  return (
    <AttendanceReportSheet
      open
      step={step}
      onReasonStep={() => setStep('reason')}
      onTypeStep={() => setStep('type')}
      onComplete={onComplete}
      onOpenChange={onOpenChange}
    />
  );
}

function setup({ onOpenChange }: { onOpenChange?: (open: boolean) => void } = {}) {
  const client = createAppQueryClient();
  client.setQueryData(nativeSessionQueryOptions(true).queryKey, signedIn);
  const view = render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <SheetFlow onOpenChange={onOpenChange} />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
  return { ...view, client };
}

async function openReasonStep(type = '지각') {
  const user = userEvent.setup();
  (await screen.findByRole('dialog')).style.transform = 'none';
  await user.click(await screen.findByRole('radio', { name: type }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  screen.getByRole('dialog').style.transform = 'none';
  return user;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-07T04:29:59.999Z'));
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  server.use(http.get(weekUrl, () => HttpResponse.json(week)));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  onComplete.mockReset();
});

it('유형 선택 뒤 사유를 입력해 실제 보고를 제출한다', async () => {
  const request = vi.fn<(body: unknown, authorization: string | null) => void>();
  server.use(
    http.post(reportUrl, async ({ request: incoming }) => {
      request(await incoming.json(), incoming.headers.get('Authorization'));
      return HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 });
    }),
  );
  setup();
  const user = await openReasonStep('조퇴');
  const reason = screen.getByRole('textbox', { name: '사유' });

  await user.type(reason, ' 병원 방문 ');
  expect(screen.getByText('7/30')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(request).toHaveBeenCalledWith(
    { types: ['EARLY_LEAVE'], reason: '병원 방문' },
    'Bearer test-token',
  );
});

it('유형과 공백 사유는 제출 뒤 오류를 표시하고 요청하지 않는다', async () => {
  const request = vi.fn<() => Response>(() =>
    HttpResponse.json({ sessionId: 1, submittedAt: '2026-11-07T04:00:00Z', reportId: 1 }),
  );
  server.use(http.post(reportUrl, request));
  setup();
  const user = userEvent.setup();

  (await screen.findByRole('dialog')).style.transform = 'none';
  await user.click(await screen.findByRole('button', { name: '다음' }));
  expect(await screen.findByText('출결 유형을 선택해 주세요.')).toBeVisible();
  await user.click(screen.getByRole('radio', { name: '결석' }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.type(screen.getByRole('textbox', { name: '사유' }), '   ');
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  expect(await screen.findByText('사유를 입력해 주세요.')).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});

it('사유 단계에서 이전으로 돌아와도 유형과 사유를 보존한다', async () => {
  setup();
  const user = await openReasonStep('결석');
  const reason = screen.getByRole('textbox', { name: '사유' });
  await user.type(reason, '개인 일정');

  await user.click(screen.getByRole('button', { name: '이전' }));
  expect(screen.getByRole('radio', { name: '결석' })).toBeChecked();
  await user.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('textbox', { name: '사유' })).toHaveValue('개인 일정');
});

it('서버 오류는 입력을 유지하고 수동 수정을 허용한다', async () => {
  server.use(
    http.post(reportUrl, () =>
      HttpResponse.json({ code: 'INVALID_ATTENDANCE_REPORT' }, { status: 400 }),
    ),
  );
  setup();
  const user = await openReasonStep();
  const reason = screen.getByRole('textbox', { name: '사유' });
  await user.type(reason, '교통 지연');
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('입력한 내용을 확인해 주세요.');
  expect(reason).toHaveValue('교통 지연');
  await user.type(reason, ' 예정');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('제출 중에는 시트를 닫지 않고 중복 제출을 막는다', async () => {
  let resolveRequest: (() => void) | undefined;
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const request = vi.fn<() => void>();
  server.use(
    http.post(
      reportUrl,
      () =>
        new Promise((resolve) => {
          request();
          resolveRequest = () =>
            resolve(
              HttpResponse.json({
                sessionId: 1,
                submittedAt: '2026-11-07T04:00:00Z',
                reportId: 1,
              }),
            );
        }),
    ),
  );
  setup({ onOpenChange });
  const user = await openReasonStep();
  await user.type(screen.getByRole('textbox', { name: '사유' }), '교통 지연');
  fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: /제출하기/ })).toBeDisabled();
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.keyUp(document, { key: 'Escape' });
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeVisible();

  act(() => resolveRequest?.());
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
});

it('세션 시작 정각부터는 보고 시트를 마감 상태로 표시한다', async () => {
  act(() => {
    vi.setSystemTime(new Date('2026-11-07T04:30:00Z'));
  });
  setup();

  expect(await screen.findByText('사전 출결 보고가 마감됐어요')).toBeVisible();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
});
