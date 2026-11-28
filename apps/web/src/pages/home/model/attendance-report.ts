/** 사전 출결 보고의 입력·마감·서버 제출 상태를 홈 슬라이스 안에서 관리합니다. */
import { ApiError } from '@yapp-plus/api';
import {
  currentWeekOptions,
  replaceMutation,
  submit1Mutation,
  zCurrentWeekAttendanceReportResponse,
  zSubmitAttendanceReportRequest,
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
import { useState } from 'react';
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
  ATTENDANCE_REPORT_ALREADY_EXISTS: '이미 제출한 보고가 있어요. 보고를 다시 열어 확인해 주세요.',
  ATTENDANCE_REPORT_NOT_FOUND: '수정할 보고를 찾지 못했어요. 보고를 다시 열어 확인해 주세요.',
};

/** 지각·조퇴 복수 선택과 공통 사유 2~30 코드포인트를 검증하며 원문을 보존합니다. */
export const attendanceReportInputSchema = zSubmitAttendanceReportRequest.extend({
  types: z
    .array(zSubmitAttendanceReportRequest.shape.types.element)
    .min(1, '출결 유형을 선택해 주세요.')
    .max(2, '지각과 조퇴만 함께 선택할 수 있어요.')
    .refine(
      (types) =>
        new Set(types).size === types.length && (!types.includes('ABSENT') || types.length === 1),
      '결석은 단독으로 선택해 주세요.',
    ),
  reason: z
    .string()
    .refine((value) => value.trim().length > 0, '사유를 입력해 주세요.')
    .refine((value) => Array.from(value).length >= 2, '사유는 2자 이상 입력해 주세요.')
    .refine((value) => Array.from(value).length <= 30, '사유는 30자 이내로 입력해 주세요.'),
});

/** 폼과 생성·수정 요청이 함께 사용하는 원문 입력입니다. */
export type AttendanceReportInput = z.input<typeof attendanceReportInputSchema>;

const currentReportSchema = zCurrentWeekAttendanceReportResponse.refine(
  (report) =>
    report.reportId === null
      ? report.types.length === 0
      : Number.isSafeInteger(Number(report.reportId)) &&
        report.reportId > 0n &&
        attendanceReportInputSchema.shape.types.safeParse(report.types).success,
  '보고 ID와 유형이 올바르지 않습니다.',
);

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
  const reportOptions = currentWeekOptions({
    ...apiOptions,
    responseValidator: (value) => currentReportSchema.parseAsync(value),
  });
  const report = useSuspenseQuery(reportOptions);
  useThrowQueryError(report);
  const [initialReport] = useState(() => report.data);
  const initialValues: AttendanceReportInput = {
    types: initialReport.types,
    reason: initialReport.reason ?? '',
  };
  const session = week.data.session;
  const reportable = isAttendanceReportOpen(session);
  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: options.queryKey });
    void queryClient.invalidateQueries({ queryKey: reportOptions.queryKey });
  };
  const create = useMutation({ ...submit1Mutation(apiOptions), onSuccess });
  const update = useMutation({ ...replaceMutation(apiOptions), onSuccess });
  const mutation = initialReport.reportId === null ? create : update;

  return {
    initialValues,
    editing: initialReport.reportId !== null,
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
      const blockMessage = getAttendanceReportSubmissionBlockMessage({
        isNative,
        reportable: isAttendanceReportOpen(session),
      });
      if (blockMessage) {
        return blockMessage;
      }
      if (initialReport.reportId === null) {
        create.mutate({ body: parsed.data }, { onSuccess: onComplete });
      } else {
        update.mutate(
          { body: parsed.data, path: { reportId: initialReport.reportId } },
          { onSuccess: onComplete },
        );
      }
      return undefined;
    },
  };
}
