/** 사전 출결 보고의 입력·마감·서버 제출 상태를 홈 슬라이스 안에서 관리합니다. */
import { ApiError } from '@yapp-plus/api';
import {
  submit1Mutation,
  zErrorResponse,
  type CurrentWeekSessionResponse,
} from '@yapp-plus/api/generated';
import {
  onlineManager,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { z } from 'zod';
import { useNativeAuthSession } from '@/features/auth';
import { staticContentEnabled } from '@/features/static-content';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';
import { useThrowQueryError } from '@/shared/lib/query-error-policy';
import { currentWeekQueryOptions } from './current-week-query';

const reportMessages: Record<string, string> = {
  INVALID_ATTENDANCE_REPORT: '입력한 내용을 확인해 주세요.',
  AUTHENTICATION_FAILED: '인증이 만료됐어요. 세션을 다시 확인한 뒤 제출해 주세요.',
  ATTENDANCE_REPORT_NOT_ELIGIBLE: '사전 출결 보고 대상이 아니에요.',
  ATTENDANCE_SESSION_NOT_FOUND: '보고할 세션을 찾지 못했어요. 세션을 다시 확인해 주세요.',
  ATTENDANCE_REPORT_UNAVAILABLE: '지금은 사전 출결 보고를 할 수 없어요.',
  ATTENDANCE_REPORT_SESSION_CHANGED: '세션 정보가 변경됐어요. 다시 확인한 뒤 제출해 주세요.',
  ATTENDANCE_REPORT_SESSION_CONFLICT: '세션 정보가 변경됐어요. 다시 확인한 뒤 제출해 주세요.',
};

/** 사전 보고 Form이 제출 전 검증하고, trim한 사유만 API에 전달하는 입력 계약입니다. */
export const attendanceReportInputSchema = z.object({
  type: z.enum(['LATE', 'EARLY_LEAVE', 'ABSENT']),
  reason: z
    .string()
    .refine((value) => value.length <= 30, '사유는 30자 이내로 입력해 주세요.')
    .transform((value) => value.trim())
    .pipe(z.string().min(1, '사유를 입력해 주세요.')),
});

/** 사전 보고 Form이 받는 원본 입력입니다. 사유의 공백 제거 전 값을 보존합니다. */
export type AttendanceReportInput = z.input<typeof attendanceReportInputSchema>;

type AttendanceReportSession = Pick<
  NonNullable<CurrentWeekSessionResponse['session']>,
  'date' | 'startTime'
>;

function getAttendanceReportErrorMessage(error: unknown) {
  if (!error) {
    return '';
  }
  const parsed = zErrorResponse
    .pick({ code: true })
    .safeParse(error instanceof ApiError ? error.body : error);
  return (
    reportMessages[parsed.success ? parsed.data.code : ''] ??
    '출결 보고 결과를 확인하지 못했어요. 다시 시도해 주세요.'
  );
}

function getAttendanceReportSubmissionBlockMessage({
  isNative,
  reportable,
}: {
  isNative: boolean;
  reportable: boolean;
}): string | null {
  if (!isNative || staticContentEnabled() || !reportable) {
    return '현재는 사전 출결 보고를 할 수 없어요.';
  }
  if (!onlineManager.isOnline() || !navigator.onLine) {
    return '인터넷 연결을 확인한 뒤 다시 제출해 주세요.';
  }
  return null;
}

/** 한국 시간의 세션 시작 전일 때만 사전 출결 보고를 허용합니다. */
export function isAttendanceReportOpen(session: AttendanceReportSession | null, now = Date.now()) {
  return session !== null && now < koreanTimestamp(session.date, session.startTime);
}

/** 현재 주간 세션에 대한 사전 출결 보고 mutation과 오류 상태를 제공합니다. `submit`은 요청을 시작하지 못하면 안내 문구를 반환합니다. */
export function useAttendanceReport(onComplete: () => void) {
  const { apiOptions, isNative } = useNativeAuthSession();
  const queryClient = useQueryClient();
  const options = currentWeekQueryOptions(apiOptions);
  const week = useSuspenseQuery(options);
  useThrowQueryError(week);
  const session = week.data.session;
  const reportable = isAttendanceReportOpen(session);
  const mutation = useMutation({
    ...submit1Mutation(apiOptions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });

  return {
    target: session,
    reportable,
    pending: mutation.isPending,
    error: getAttendanceReportErrorMessage(mutation.error),
    reset: mutation.reset,
    submit: (input: AttendanceReportInput): string | undefined => {
      if (mutation.isPending) {
        return undefined;
      }
      const parsed = attendanceReportInputSchema.safeParse(input);
      if (!parsed.success) {
        return undefined;
      }
      const blockMessage = getAttendanceReportSubmissionBlockMessage({ isNative, reportable });
      if (blockMessage) {
        return blockMessage;
      }
      mutation.mutate({ body: parsed.data }, { onSuccess: onComplete });
      return undefined;
    },
  };
}
