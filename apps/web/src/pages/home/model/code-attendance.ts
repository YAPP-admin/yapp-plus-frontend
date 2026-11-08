import {
  onlineManager,
  useMutationState,
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  find5QueryKey,
  mineQueryKey,
  verifyMutation,
  verifyMutationKey,
  zVerifyAttendanceCodeResponse,
} from '@yapp-plus/api/generated';
import { useNativeAuthSession } from '@/features/auth';
import { currentWeekQueryOptions } from './current-week-query';
import { staticContentEnabled } from '@/features/static-content';

/** 서버가 확인한 성공 결과만 앱 수명 동안 보존합니다. */
export function useAttendanceConfirmation() {
  const confirmations = useMutationState({
    filters: { mutationKey: verifyMutationKey(), status: 'success' },
    select: ({ state }) => (typeof state.context === 'number' ? state.context : null),
  });
  return confirmations.at(-1) ?? null;
}

const messages: Record<string, string> = {
  INVALID_ATTENDANCE_CODE: '출석 코드가 올바르지 않아요.',
  ATTENDANCE_SESSION_NOT_FOUND: '출석할 세션을 찾지 못했어요. 세션을 다시 확인해 주세요.',
  ATTENDANCE_UNAVAILABLE: '지금은 출석할 수 없어요. 세션을 다시 확인해 주세요.',
  AUTHENTICATION_FAILED: '인증이 만료됐어요. 세션을 다시 확인한 뒤 제출해 주세요.',
};

class SubmissionError extends Error {}

export function useCodeAttendance(onComplete: () => void) {
  const { apiOptions } = useNativeAuthSession();
  const client = useQueryClient();
  const options = currentWeekQueryOptions(apiOptions);
  const week = useSuspenseQuery(options);
  const session = week.data.session;
  const confirmed = useAttendanceConfirmation();

  const mutation = useMutation({
    ...verifyMutation({
      ...apiOptions,
      retry: 0,
      responseValidator: async (value) => {
        const parsed = await zVerifyAttendanceCodeResponse.safeParseAsync(value);
        if (!parsed.success || !parsed.data.verified) {
          throw new SubmissionError('출석 결과를 확인하지 못했어요. 다시 시도해 주세요.');
        }
      },
    }),
    gcTime: Infinity,
    retry: false,
    networkMode: 'always',
    onMutate: ({ body }) => {
      if (staticContentEnabled()) {
        throw new SubmissionError('지금은 출석할 수 없어요.');
      }
      if (!onlineManager.isOnline() || !navigator.onLine) {
        throw new SubmissionError('인터넷 연결을 확인한 뒤 다시 제출해 주세요.');
      }
      return body.sessionId;
    },
    onSuccess: () => {
      for (const queryKey of [options.queryKey, find5QueryKey(), mineQueryKey()]) {
        void client.invalidateQueries({ queryKey });
      }
    },
  });
  const { reset, isPending: pending } = mutation;
  const available = session?.attendanceStatus === 'AVAILABLE' && confirmed !== session.sessionId;
  const queryError = week.error && '세션을 불러오지 못했어요. 다시 확인해 주세요.';
  const submissionError =
    mutation.error &&
    (mutation.error instanceof SubmissionError
      ? mutation.error.message
      : (messages[mutation.error.code] ?? '출석 결과를 확인하지 못했어요. 다시 시도해 주세요.'));
  const availabilityError = available ? null : '현재 출석할 수 있는 세션이 없어요.';
  return {
    pending,
    disabled: !available || week.isFetching || !!week.error || pending,
    error: queryError ?? submissionError ?? availabilityError ?? '',
    reset,
    refresh: () => {
      reset();
      void week.refetch();
    },
    submit: (code: string) => {
      if (!session || !available || pending) {
        return;
      }
      mutation.mutate(
        { body: { sessionId: session.sessionId, code: Number(code) } },
        { onSuccess: onComplete },
      );
    },
  };
}
