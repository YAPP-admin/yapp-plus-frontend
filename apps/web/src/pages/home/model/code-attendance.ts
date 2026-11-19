/** 코드 출석의 위치 확인과 서버 제출을 순차적으로 연결합니다. */
import { ApiError } from '@yapp-plus/api';
import {
  onlineManager,
  useMutationState,
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  find6QueryKey,
  mineQueryKey,
  verifyMutation,
  verifyMutationKey,
  zVerifyAttendanceCodeResponse,
  zErrorResponse,
} from '@yapp-plus/api/generated';
import { getAppBridge, requestCurrentLocation } from '@yapp-plus/app-bridge/web';
import { useNativeAuthSession } from '@/features/auth';
import { currentWeekQueryOptions } from './current-week-query';
import { staticContentEnabled } from '@/features/static-content';
import {
  assessAttendanceLocation,
  isValidAttendanceSessionLocation,
  type LocationAttendanceResult,
} from './location-attendance';

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

/** 사용자에게 그대로 안내할 수 있는 예상 가능한 코드 출석 실패입니다. */
class SubmissionError extends Error {}

const locationCheckMutationKey = ['attendance', 'location-check'] as const;

/** 위치 확인을 시작할 때 고정해 두는 출석 세션의 ID와 장소 좌표입니다. */
type AttendanceSessionSnapshot = Readonly<{
  sessionId: number;
  latitude: number | null;
  longitude: number | null;
}>;

/** 위치 평가 실패 사유를 사용자가 다음 행동을 알 수 있는 안내 문구로 변환합니다. */
const getLocationAssessmentMessage = (
  assessment: Exclude<LocationAttendanceResult, { status: 'ALLOWED' }>,
): string => {
  switch (assessment.reason) {
    case 'PRECISE_LOCATION_REQUIRED':
      return '정확한 위치 권한을 허용해 주세요.';
    case 'LOCATION_ACCURACY_UNAVAILABLE':
    case 'LOCATION_ACCURACY_TOO_LOW':
      return '현재 위치를 정확하게 확인하지 못했어요. 다시 시도해 주세요.';
    case 'OUT_OF_RANGE':
      return '세션 장소에서 100m 이내로 이동해 주세요.';
    case 'INVALID_SESSION_LOCATION':
      return '세션 장소 정보를 확인하지 못했어요. 다시 확인해 주세요.';
    case 'INVALID_CURRENT_LOCATION':
    case 'DISTANCE_UNAVAILABLE':
      return '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.';
  }

  const unreachable: never = assessment;
  return unreachable;
};

/** 출석 API의 성공 응답 구조와 실제 인증 완료 여부를 검증합니다. */
const validateSuccessfulAttendanceResponse = async (value: unknown): Promise<void> => {
  const response = await zVerifyAttendanceCodeResponse.parseAsync(value);
  if (!response.verified) {
    throw new SubmissionError('출석 결과를 확인하지 못했어요. 다시 시도해 주세요.');
  }
};

/** 위치 확인에 필요한 코드와 출석 세션 스냅샷입니다. */
type AttendanceLocationCheckInput = Readonly<{
  code: string;
  sessionSnapshot: AttendanceSessionSnapshot;
}>;

/** 위치 확인을 통과한 뒤 같은 세션과 코드로 서버 제출을 이어서 실행합니다. */
export function useCodeAttendance(onComplete: () => void, isSheetOpen: boolean) {
  const { apiOptions } = useNativeAuthSession();
  const client = useQueryClient();
  const options = currentWeekQueryOptions(apiOptions);
  const week = useSuspenseQuery(options);
  const session = week.data.session;
  const confirmed = useAttendanceConfirmation();

  const attendanceMutation = useMutation({
    ...verifyMutation({
      ...apiOptions,
      retry: 0,
      responseValidator: validateSuccessfulAttendanceResponse,
    }),
    gcTime: Infinity,
    retry: false,
    networkMode: 'always',
    onMutate: ({ body }) => body.sessionId,
    onSuccess: () => {
      for (const queryKey of [options.queryKey, find6QueryKey(), mineQueryKey()]) {
        void client.invalidateQueries({ queryKey });
      }
    },
  });
  const locationCheckMutation = useMutation({
    mutationKey: locationCheckMutationKey,
    networkMode: 'always',
    mutationFn: async ({ code, sessionSnapshot }: AttendanceLocationCheckInput) => {
      if (!isValidAttendanceSessionLocation(sessionSnapshot)) {
        throw new SubmissionError('세션 장소 정보를 확인하지 못했어요. 다시 확인해 주세요.');
      }
      if (staticContentEnabled()) {
        throw new SubmissionError('지금은 출석할 수 없어요.');
      }
      if (!onlineManager.isOnline() || !navigator.onLine) {
        throw new SubmissionError('인터넷 연결을 확인한 뒤 다시 제출해 주세요.');
      }
      if (!getAppBridge().isNativeMethodAvailable('requestCurrentLocation')) {
        throw new SubmissionError('위치 확인이 가능한 YAPP+ 앱에서 다시 시도해 주세요.');
      }

      const locationResult = await requestCurrentLocation();
      if (locationResult.status !== 'SUCCESS') {
        throw new SubmissionError('현재 위치를 확인하지 못했어요. 다시 시도해 주세요.');
      }

      const locationAssessment = assessAttendanceLocation(locationResult.location, sessionSnapshot);
      if (locationAssessment.status !== 'ALLOWED') {
        throw new SubmissionError(getLocationAssessmentMessage(locationAssessment));
      }

      return {
        body: {
          sessionId: sessionSnapshot.sessionId,
          code: Number(code),
        },
      };
    },
  });
  const pending = locationCheckMutation.isPending || attendanceMutation.isPending;
  const available = session?.attendanceStatus === 'AVAILABLE' && confirmed !== session.sessionId;
  const queryError = week.error && '세션을 불러오지 못했어요. 다시 확인해 주세요.';
  const parsedError = zErrorResponse
    .pick({ code: true })
    .safeParse(
      attendanceMutation.error instanceof ApiError
        ? attendanceMutation.error.body
        : attendanceMutation.error,
    );
  const submissionError =
    attendanceMutation.error &&
    (attendanceMutation.error instanceof SubmissionError
      ? attendanceMutation.error.message
      : (messages[parsedError.success ? parsedError.data.code : ''] ??
        '출석 결과를 확인하지 못했어요. 다시 시도해 주세요.'));
  const locationError =
    locationCheckMutation.error &&
    (locationCheckMutation.error instanceof SubmissionError
      ? locationCheckMutation.error.message
      : '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.');
  const availabilityError = available ? null : '현재 출석할 수 있는 세션이 없어요.';

  const reset = () => {
    locationCheckMutation.reset();
    attendanceMutation.reset();
  };
  const error = [queryError, locationError, submissionError, availabilityError].find(
    (message): message is string => typeof message === 'string' && message.length > 0,
  );

  return {
    pending,
    disabled: !available || week.isFetching || !!week.error || pending,
    error: error ?? '',
    reset,
    refresh: () => {
      reset();
      void week.refetch();
    },
    submit: (code: string) => {
      if (!session || !available || pending || !isSheetOpen) {
        return;
      }
      const sessionSnapshot: AttendanceSessionSnapshot = {
        sessionId: session.sessionId,
        latitude: session.latitude,
        longitude: session.longitude,
      };
      reset();
      locationCheckMutation.mutate(
        { code, sessionSnapshot },
        {
          onSuccess: (attendanceRequest) =>
            attendanceMutation.mutate(attendanceRequest, { onSuccess: onComplete }),
        },
      );
    },
  };
}
