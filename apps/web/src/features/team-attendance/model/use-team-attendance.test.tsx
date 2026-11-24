/** 훅의 중복 실행·결과 불명 잠금·화면 수명을 검증한다. HTTP 정책은 제출 함수 테스트에 둔다. */
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  SubmissionError,
  teamAttendanceTargetSchema,
  type SubmissionInput,
} from './submission-input';
import { type TeamAttendanceReceipt } from './use-photo-submission';
import { useTeamAttendance } from './use-team-attendance';

const { submitPhoto } = vi.hoisted(() => ({
  submitPhoto:
    vi.fn<(input: SubmissionInput, signal: AbortSignal) => Promise<TeamAttendanceReceipt>>(),
}));
vi.mock('./use-photo-submission', () => ({
  usePhotoSubmission: () => ({ submitPhoto }),
}));
const input: SubmissionInput = {
  target: teamAttendanceTargetSchema.parse({
    sessionId: 1,
    teamId: 1,
    teamName: '팀',
    selfMembershipId: 10,
    members: [{ membershipId: 10, name: '본인', positionLabel: 'Web' }],
  }),
  selectedMembershipIds: [10],
  photo: new File(['abc'], 'team-attendance.jpg', { type: 'image/jpeg' }),
};
const receipt: TeamAttendanceReceipt = {
  photoId: 1,
  submittedAt: '2026-11-16T00:00:00Z',
  status: 'PENDING',
  teamName: '팀',
  members: input.target.members,
};
const onSubmitted = vi.fn<(receipt: TeamAttendanceReceipt) => void>();
function setup() {
  const client = new QueryClient();
  const hook = renderHook(() => useTeamAttendance(input.target, {}, onSubmitted), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  act(() => hook.result.current.form.setFieldValue('photo', input.photo));
  return { ...hook, client };
}
function pendingReceipt() {
  let resolve: ((value: TeamAttendanceReceipt) => void) | undefined;
  const promise = new Promise<TeamAttendanceReceipt>((done) => {
    resolve = done;
  });
  return { promise, resolve: (value: TeamAttendanceReceipt) => resolve?.(value) };
}

beforeEach(() => vi.resetAllMocks());
it('연속 클릭은 한 번만 실행하며 성공 뒤 재전송을 막는다', async () => {
  const deferred = pendingReceipt();
  vi.mocked(submitPhoto).mockReturnValue(deferred.promise);
  const { result, client } = setup();
  act(() => {
    void result.current.form.handleSubmit();
    void result.current.form.handleSubmit();
  });
  await waitFor(() => expect(submitPhoto).toHaveBeenCalledTimes(1));
  expect(result.current.isPending).toBe(true);
  expect(client.getMutationCache().getAll()[0]?.state.variables).toEqual({
    request: deferred.promise,
    signal: expect.any(AbortSignal),
  });

  act(() => deferred.resolve(receipt));
  await waitFor(() => expect(result.current.receipt).toEqual(receipt));
  expect(result.current.isPending).toBe(false);
  await act(async () => {
    await result.current.form.handleSubmit();
  });
  expect(submitPhoto).toHaveBeenCalledTimes(1);
  expect(onSubmitted).toHaveBeenCalledExactlyOnceWith(receipt);
});
it.each(['failed', 'unknown'] as const)('%s 후 재제출 가능 여부를 구분한다', async (kind) => {
  vi.mocked(submitPhoto).mockRejectedValue(new SubmissionError(kind, '안내'));
  const { result } = setup();
  await act(async () => {
    await result.current.form.handleSubmit();
  });
  await waitFor(() => expect(result.current.error).toMatchObject({ kind }));
  await act(async () => {
    await result.current.form.handleSubmit();
  });
  await waitFor(() => expect(submitPhoto).toHaveBeenCalledTimes(kind === 'failed' ? 2 : 1));
});
it('폼 이탈 후 늦은 접수를 무시하고 새 폼에서는 다시 제출할 수 있다', async () => {
  const deferred = pendingReceipt();
  vi.mocked(submitPhoto).mockReturnValue(deferred.promise);
  const hook = setup();
  act(() => {
    void hook.result.current.form.handleSubmit();
  });
  await waitFor(() => expect(submitPhoto).toHaveBeenCalledTimes(1));
  const signal = vi.mocked(submitPhoto).mock.calls[0]?.[1];
  hook.unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    deferred.resolve(receipt);
    await deferred.promise;
  });
  expect(hook.result.current.receipt).toBeNull();
  expect(onSubmitted).not.toHaveBeenCalled();
  vi.mocked(submitPhoto).mockResolvedValue(receipt);
  const next = setup();
  await act(async () => {
    await next.result.current.form.handleSubmit();
  });
  await waitFor(() => expect(next.result.current.receipt).toEqual(receipt));
});

it.each([{ ids: [] }, { ids: [10, 10] }, { ids: [10, 99] }])(
  '폼의 참석자 정책 위반은 mutation 실행 전에 막는다: %j',
  async ({ ids }) => {
    const { result } = setup();
    act(() => result.current.form.setFieldValue('selectedMembershipIds', ids));
    await act(async () => {
      await result.current.form.handleSubmit();
    });
    expect(result.current.form.state.errorMap.onDynamic?.selectedMembershipIds).toBeDefined();
    expect(submitPhoto).not.toHaveBeenCalled();
  },
);
it('사진 미선택은 필드 오류로 남기고 사진 선택 후에는 본인을 포함해 제출한다', async () => {
  vi.mocked(submitPhoto).mockResolvedValue(receipt);
  const { result } = setup();
  act(() => result.current.form.setFieldValue('photo', null));
  await act(async () => {
    await result.current.form.handleSubmit();
  });
  expect(result.current.form.state.errorMap.onDynamic?.photo).toBeDefined();
  expect(submitPhoto).not.toHaveBeenCalled();
  act(() => result.current.form.setFieldValue('photo', input.photo));
  await act(async () => {
    await result.current.form.handleSubmit();
  });
  expect(submitPhoto).toHaveBeenCalledWith(input, expect.any(AbortSignal));
});
it.each([{ members: [] }, { members: [...input.target.members, ...input.target.members] }])(
  '공급 경계는 본인 누락·중복 명단을 거부한다: %j',
  ({ members }) => {
    expect(teamAttendanceTargetSchema.safeParse({ ...input.target, members }).success).toBe(false);
  },
);
it('폼 검증 중 이탈하면 늦은 onSubmit도 요청을 시작하지 않는다', async () => {
  const hook = setup();
  await act(async () => {
    const pending = hook.result.current.form.handleSubmit();
    hook.unmount();
    await pending;
  });
  expect(submitPhoto).not.toHaveBeenCalled();
});
