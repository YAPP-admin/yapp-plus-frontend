import { useEffect, useState } from 'react';
import {
  onlineManager,
  useIsMutating,
  useMutationState,
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  find3Options,
  find5QueryKey,
  mineQueryKey,
  verifyMutation,
  verifyMutationKey,
  zVerifyAttendanceCodeResponse,
} from '@yapp-plus/api/generated';
import { nativeSessionQueryOptions, useNativeAuthSession } from '@/features/auth';
import { currentWeekSchema } from './current-week-schema';

function useAttendanceOwner() {
  const auth = useNativeAuthSession();
  return { ...auth, owner: JSON.stringify([auth.session?.userId, auth.session?.sessionId]) };
}

/** 서버가 확인한 성공 결과만 앱 수명 동안 보존합니다. */
export function useAttendanceConfirmation() {
  const { owner } = useAttendanceOwner();
  const confirmations = useMutationState({
    filters: { mutationKey: [...verifyMutationKey(), { owner }], status: 'success' },
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

export function useCodeAttendance(open: boolean, onComplete: () => void) {
  const { owner, isNative, apiOptions } = useAttendanceOwner();
  const client = useQueryClient();
  const options = find3Options({
    ...apiOptions,
    responseValidator: (value) => currentWeekSchema.parseAsync(value),
  });
  const week = useSuspenseQuery(options);
  const [targetId] = useState(() => week.data.session?.sessionId ?? null);
  const confirmed = useAttendanceConfirmation();
  const mutationKey = [...verifyMutationKey(), { owner }];
  const pending = useIsMutating({ mutationKey }) > 0;

  const currentSession = () => {
    const result = client.getQueryData(nativeSessionQueryOptions(true).queryKey);
    return result?.status === 'SIGNED_IN' ? result.session : undefined;
  };
  const assertOwner = () => {
    const current = currentSession();
    if (isNative && (!current || JSON.stringify([current.userId, current.sessionId]) !== owner)) {
      throw new SubmissionError('계정이 변경됐어요. 홈에서 다시 출석해 주세요.');
    }
  };
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
    mutationKey,
    gcTime: Infinity,
    retry: false,
    networkMode: 'always',
    onMutate: async (variables) => {
      if (!open) {
        throw new SubmissionError('앱에 로그인한 후 출석해 주세요.');
      }
      assertOwner();
      if (!onlineManager.isOnline() || !navigator.onLine) {
        throw new SubmissionError('인터넷 연결을 확인한 뒤 다시 제출해 주세요.');
      }
      const latest = await client.fetchQuery({
        ...options,
        staleTime: 0,
        networkMode: 'always',
        retry: false,
      });
      assertOwner();
      const session = latest.session;
      if (!session || session.sessionId !== targetId) {
        throw new SubmissionError('세션이 변경됐어요. 홈에서 다시 출석해 주세요.');
      }
      if (session.attendanceStatus !== 'AVAILABLE' || confirmed === targetId) {
        throw new SubmissionError('지금은 출석할 수 없어요. 세션을 다시 확인해 주세요.');
      }
      variables.auth = isNative ? currentSession()?.accessToken : apiOptions.auth;
      return session.sessionId;
    },
    onSuccess: () => {
      assertOwner();
      for (const queryKey of [options.queryKey, find5QueryKey(), mineQueryKey()]) {
        void client.invalidateQueries({ queryKey });
      }
    },
  });
  const { reset } = mutation;
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);
  const available =
    week.data.session?.sessionId === targetId &&
    week.data.session?.attendanceStatus === 'AVAILABLE' &&
    confirmed !== targetId;
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
      if (client.isMutating({ mutationKey })) {
        return;
      }
      mutation.mutate(
        { body: { sessionId: targetId ?? 0, code: Number(code) } },
        { onSuccess: onComplete },
      );
    },
  };
}
