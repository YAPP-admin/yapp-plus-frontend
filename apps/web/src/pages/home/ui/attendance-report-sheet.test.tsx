/** 사전 출결 보고 시트의 단계·입력·제출 UI를 검증합니다. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { NativeAuthSessionProvider, nativeSessionQueryOptions } from '@/features/auth';
import { createAppQueryClient } from '@/app/providers';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { delay, http, HttpResponse } from 'msw';
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
  initialStep = 'type',
}: {
  onOpenChange?: (open: boolean) => void;
  initialStep?: AttendanceReportStep;
}) {
  const [step, setStep] = useState<AttendanceReportStep>(initialStep);
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

function setup({
  onOpenChange,
  initialStep,
}: { onOpenChange?: (open: boolean) => void; initialStep?: AttendanceReportStep } = {}) {
  const client = createAppQueryClient();
  client.setQueryData(nativeSessionQueryOptions(true).queryKey, signedIn);
  const view = render(
    <QueryClientProvider client={client}>
      <NativeAuthSessionProvider>
        <SheetFlow onOpenChange={onOpenChange} initialStep={initialStep} />
      </NativeAuthSessionProvider>
    </QueryClientProvider>,
  );
  return { ...view, client };
}

async function openReasonStep(type = '지각') {
  const user = userEvent.setup();
  (await screen.findByRole('dialog')).style.transform = 'none';
  await user.click(await screen.findByRole('checkbox', { name: type }));
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
  expect(screen.getByRole('status')).toHaveTextContent('7/30');
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  expect(request).toHaveBeenCalledWith(
    { types: ['EARLY_LEAVE'], reason: ' 병원 방문 ' },
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
  await user.click(screen.getByRole('checkbox', { name: '결석' }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.type(screen.getByRole('textbox', { name: '사유' }), '   ');
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  expect(await screen.findByText('사유를 입력해 주세요.')).toBeVisible();
  expect(request).not.toHaveBeenCalled();
});

it('저장한 복수 유형과 사유로 다시 열고 수정한 결과도 재진입에 반영한다', async () => {
  const first = setup();
  const user = await openReasonStep();
  await user.click(screen.getByRole('button', { name: '이전' }));
  await user.click(screen.getByRole('checkbox', { name: '조퇴' }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.type(screen.getByRole('textbox', { name: '사유' }), '개인 일정');
  await user.click(screen.getByRole('button', { name: '제출하기' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  first.unmount();
  const second = setup();
  expect(await screen.findByRole('checkbox', { name: '지각' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: '조퇴' })).toBeChecked();
  screen.getByRole('dialog').style.transform = 'none';
  await user.click(screen.getByRole('button', { name: '다음' }));
  const reason = screen.getByRole('textbox', { name: '사유' });
  expect(reason).toHaveValue('개인 일정');
  await user.clear(reason);
  await user.type(reason, '병원 방문');
  expect(fireEvent.keyDown(reason, { key: 'Enter', isComposing: true })).toBe(false);
  await user.click(screen.getByRole('button', { name: '수정하기' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(2));
  second.unmount();
  setup();
  await screen.findByRole('checkbox', { name: '지각' });
  screen.getByRole('dialog').style.transform = 'none';
  await user.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('textbox', { name: '사유' })).toHaveValue('병원 방문');
});

it('보고 조회 실패를 빈 폼으로 처리하지 않고 재시도로 복구한다', async () => {
  server.use(http.get(`${reportUrl}/current-week`, () => HttpResponse.json({}, { status: 400 })));
  setup();
  expect(await screen.findByText('출결 보고 정보를 불러오지 못했어요')).toBeVisible();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  server.use(
    http.get(`${reportUrl}/current-week`, () =>
      HttpResponse.json({
        reportId: 42,
        types: ['ABSENT'],
        type: 'ABSENT',
        reason: null,
        submittedAt: '2026-11-07T04:00:00Z',
      }),
    ),
  );
  screen.getByRole('dialog').style.transform = 'none';
  await userEvent.click(screen.getByRole('button', { name: '보고 다시 확인' }));
  expect(await screen.findByRole('checkbox', { name: '결석' })).toBeChecked();
  await userEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('textbox', { name: '사유' })).toHaveValue('');
  expect(screen.getByRole('button', { name: '수정하기' })).toBeVisible();
});

it('사유 단계에서 이전으로 돌아와도 유형과 사유를 보존한다', async () => {
  setup();
  const user = await openReasonStep('결석');
  const reason = screen.getByRole('textbox', { name: '사유' });
  await user.type(reason, '개인 일정');

  await user.click(screen.getByRole('button', { name: '이전' }));
  expect(screen.getByRole('checkbox', { name: '결석' })).toBeChecked();
  await user.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('textbox', { name: '사유' })).toHaveValue('개인 일정');
});

it('지각·조퇴를 함께 선택하고 결석으로 전환하면 제목·예시와 선택을 갱신한다', async () => {
  setup();
  const user = await openReasonStep('지각');
  expect(screen.getByRole('dialog')).toHaveAccessibleName('지각 사유를 입력해 주세요');
  await user.click(screen.getByRole('button', { name: '이전' }));
  await user.click(screen.getByRole('checkbox', { name: '조퇴' }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('dialog')).toHaveAccessibleName('지각·조퇴 사유를 입력해 주세요');
  expect(screen.getByText('[예시] 교통 체증으로 지각하고 코딩 테스트로 조퇴합니다.')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '이전' }));
  await user.click(screen.getByRole('checkbox', { name: '결석' }));
  expect(screen.getByRole('checkbox', { name: '지각' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: '조퇴' })).not.toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: '조퇴' }));
  expect(screen.getByRole('checkbox', { name: '결석' })).not.toBeChecked();
});

it('초과 붙여넣기와 blur에서는 오류를 숨기고 제출 후 입력마다 재검증한다', async () => {
  setup();
  const user = await openReasonStep();
  const reason = screen.getByRole('textbox', { name: '사유' });
  await user.click(reason);
  await user.paste('😀'.repeat(31));
  expect(reason).toHaveValue('😀'.repeat(31));
  expect(screen.getByRole('status')).toHaveTextContent('31/30');
  expect(reason.tagName).toBe('TEXTAREA');
  expect(screen.queryByText('사유는 30자 이내로 입력해 주세요.')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.queryByText('사유는 30자 이내로 입력해 주세요.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '제출하기' }));
  expect(screen.getByText('사유는 30자 이내로 입력해 주세요.')).toBeVisible();
  expect(reason).toHaveFocus();
  await user.clear(reason);
  await user.type(reason, '병원');
  expect(screen.queryByText('사유는 30자 이내로 입력해 주세요.')).not.toBeInTheDocument();
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
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

it.each(['type', 'reason'] as const)(
  '조회 중 %s 단계 제목과 스켈레톤을 표시하고 닫기를 허용한다',
  async (initialStep) => {
    server.use(
      http.get(weekUrl, async () => {
        await delay('infinite');
        return HttpResponse.json(week);
      }),
    );
    const onOpenChange = vi.fn<(open: boolean) => void>();
    setup({ initialStep, onOpenChange });
    expect(
      await screen.findByRole('region', { name: '출결 보고를 준비하고 있어요' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('heading', {
        name: initialStep === 'type' ? '출결을 보고해 주세요' : '사유를 입력해 주세요',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    screen.getByRole('dialog').style.transform = 'none';
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  },
);
