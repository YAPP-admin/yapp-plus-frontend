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
import type { LocationFailure } from '@yapp-plus/app-bridge';
import { getAppBridge, openAppSettings, requestCurrentLocation } from '@yapp-plus/app-bridge/web';
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

type AttendanceIssueKind = 'LOCATION' | 'SESSION' | 'SUBMISSION';
type AttendanceRecovery = 'OPEN_SETTINGS' | 'REFRESH_SESSION' | null;

/** 사용자에게 안내할 문구와 복구 행동이 정해진 출석 흐름 실패입니다. */
class AttendanceFlowError extends Error {
  constructor(
    readonly kind: AttendanceIssueKind,
    message: string,
    readonly recovery: AttendanceRecovery = null,
  ) {
    super(message);
  }
}

const submissionIssues: Record<string, AttendanceFlowError> = {
  ATTENDANCE_SESSION_NOT_FOUND: new AttendanceFlowError(
    'SESSION',
    '출석할 세션을 찾지 못했어요. 세션을 다시 확인해 주세요.',
    'REFRESH_SESSION',
  ),
  ATTENDANCE_UNAVAILABLE: new AttendanceFlowError(
    'SESSION',
    '지금은 출석할 수 없어요. 세션을 다시 확인해 주세요.',
    'REFRESH_SESSION',
  ),
  AUTHENTICATION_FAILED: new AttendanceFlowError(
    'SESSION',
    '인증이 만료됐어요. 세션을 다시 확인한 뒤 제출해 주세요.',
    'REFRESH_SESSION',
  ),
};

const locationCheckMutationKey = ['attendance', 'location-check'] as const;
const openLocationSettingsMutationKey = ['attendance', 'open-location-settings'] as const;
const invalidAttendanceCode = 'INVALID_ATTENDANCE_CODE';

/** 위치 확인을 시작할 때 고정해 두는 출석 세션의 ID와 장소 좌표입니다. */
type AttendanceSessionSnapshot = Readonly<{
  sessionId: number;
  latitude: number | null;
  longitude: number | null;
}>;

/** 위치 평가 실패 사유를 사용자 안내와 복구 행동이 포함된 오류로 변환합니다. */
const getLocationAssessmentError = (
  assessment: Exclude<LocationAttendanceResult, { status: 'ALLOWED' }>,
): AttendanceFlowError => {
  switch (assessment.reason) {
    case 'PRECISE_LOCATION_REQUIRED':
      return new AttendanceFlowError(
        'LOCATION',
        '정확한 위치 권한을 허용해 주세요.',
        'OPEN_SETTINGS',
      );
    case 'LOCATION_ACCURACY_UNAVAILABLE':
    case 'LOCATION_ACCURACY_TOO_LOW':
      return new AttendanceFlowError(
        'LOCATION',
        '현재 위치를 정확하게 확인하지 못했어요. 다시 시도해 주세요.',
      );
    case 'OUT_OF_RANGE':
      return new AttendanceFlowError('LOCATION', '세션 장소에서 100m 이내로 이동해 주세요.');
    case 'INVALID_SESSION_LOCATION':
      return new AttendanceFlowError(
        'SESSION',
        '세션 장소 정보를 확인하지 못했어요. 다시 확인해 주세요.',
        'REFRESH_SESSION',
      );
    case 'INVALID_CURRENT_LOCATION':
    case 'DISTANCE_UNAVAILABLE':
      return new AttendanceFlowError(
        'LOCATION',
        '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.',
      );
  }

  const unreachable: never = assessment;
  return unreachable;
};

/** 네이티브 위치 요청 실패를 원문 없이 화면 복구 행동이 포함된 오류로 변환합니다. */
const getLocationFailureError = (failure: LocationFailure): AttendanceFlowError => {
  if (failure.code === 'PERMISSION_DENIED') {
    return failure.canAskAgain
      ? new AttendanceFlowError('LOCATION', '위치 권한을 허용해 주세요.')
      : new AttendanceFlowError(
          'LOCATION',
          '앱 설정에서 위치 권한을 허용해 주세요.',
          'OPEN_SETTINGS',
        );
  }

  const messages: Record<Exclude<LocationFailure['code'], 'PERMISSION_DENIED'>, string> = {
    SERVICES_DISABLED: '기기 위치 서비스를 켜 주세요.',
    TIMEOUT: '위치 확인 시간이 지났어요. 다시 시도해 주세요.',
    BUSY: '이전 위치 요청을 처리하고 있어요. 잠시 후 다시 시도해 주세요.',
    APP_INACTIVE: '앱을 연 상태에서 다시 시도해 주세요.',
    LOCATION_UNAVAILABLE: '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.',
  };
  return new AttendanceFlowError('LOCATION', messages[failure.code]);
};

/** 출석 API 오류에서 서버 오류 코드만 신뢰 경계 스키마로 추출합니다. */
const getAttendanceErrorCode = (error: unknown): string | null => {
  const parsed = zErrorResponse
    .pick({ code: true })
    .safeParse(error instanceof ApiError ? error.body : error);
  return parsed.success ? parsed.data.code : null;
};

/** 출석 API의 성공 응답 구조와 실제 인증 완료 여부를 검증합니다. */
const validateSuccessfulAttendanceResponse = async (value: unknown): Promise<void> => {
  const response = await zVerifyAttendanceCodeResponse.parseAsync(value);
  if (!response.verified) {
    throw new AttendanceFlowError(
      'SUBMISSION',
      '출석 결과를 확인하지 못했어요. 다시 시도해 주세요.',
    );
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
        throw new AttendanceFlowError(
          'SESSION',
          '세션 장소 정보를 확인하지 못했어요. 다시 확인해 주세요.',
          'REFRESH_SESSION',
        );
      }
      if (staticContentEnabled()) {
        throw new AttendanceFlowError('SESSION', '지금은 출석할 수 없어요.');
      }
      if (!onlineManager.isOnline() || !navigator.onLine) {
        throw new AttendanceFlowError('SUBMISSION', '인터넷 연결을 확인한 뒤 다시 제출해 주세요.');
      }
      if (!getAppBridge().isNativeMethodAvailable('requestCurrentLocation')) {
        throw new AttendanceFlowError(
          'LOCATION',
          '위치 확인이 가능한 YAPP+ 앱에서 다시 시도해 주세요.',
        );
      }

      const locationResult = await requestCurrentLocation();
      if (locationResult.status !== 'SUCCESS') {
        throw getLocationFailureError(locationResult);
      }

      const locationAssessment = assessAttendanceLocation(locationResult.location, sessionSnapshot);
      if (locationAssessment.status !== 'ALLOWED') {
        throw getLocationAssessmentError(locationAssessment);
      }

      return {
        body: {
          sessionId: sessionSnapshot.sessionId,
          code: Number(code),
        },
      };
    },
  });
  const settingsMutation = useMutation({
    mutationKey: openLocationSettingsMutationKey,
    networkMode: 'always',
    mutationFn: async () => {
      if (!getAppBridge().isNativeMethodAvailable('openAppSettings')) {
        throw new AttendanceFlowError(
          'LOCATION',
          '앱 설정을 열지 못했어요. 기기 설정에서 위치 권한을 확인해 주세요.',
          'OPEN_SETTINGS',
        );
      }
      const result = await openAppSettings();
      if (result.status === 'ERROR') {
        throw new AttendanceFlowError(
          'LOCATION',
          '앱 설정을 열지 못했어요. 기기 설정에서 위치 권한을 확인해 주세요.',
          'OPEN_SETTINGS',
        );
      }
    },
  });
  const isPending =
    locationCheckMutation.isPending || attendanceMutation.isPending || settingsMutation.isPending;
  const available = session?.attendanceStatus === 'AVAILABLE' && confirmed !== session.sessionId;
  const queryIssue =
    week.error &&
    new AttendanceFlowError(
      'SESSION',
      '세션을 불러오지 못했어요. 다시 확인해 주세요.',
      'REFRESH_SESSION',
    );
  const attendanceErrorCode = getAttendanceErrorCode(attendanceMutation.error);
  let submissionIssue: AttendanceFlowError | null = null;
  if (attendanceMutation.error && attendanceErrorCode !== invalidAttendanceCode) {
    submissionIssue =
      attendanceMutation.error instanceof AttendanceFlowError
        ? attendanceMutation.error
        : (submissionIssues[attendanceErrorCode ?? ''] ??
          new AttendanceFlowError(
            'SUBMISSION',
            '출석 결과를 확인하지 못했어요. 다시 시도해 주세요.',
          ));
  }
  const locationIssue =
    locationCheckMutation.error &&
    (locationCheckMutation.error instanceof AttendanceFlowError
      ? locationCheckMutation.error
      : new AttendanceFlowError('LOCATION', '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.'));
  const settingsIssue =
    settingsMutation.error &&
    (settingsMutation.error instanceof AttendanceFlowError
      ? settingsMutation.error
      : new AttendanceFlowError(
          'LOCATION',
          '앱 설정을 열지 못했어요. 기기 설정에서 위치 권한을 확인해 주세요.',
          'OPEN_SETTINGS',
        ));
  const availabilityIssue = available
    ? null
    : new AttendanceFlowError('SESSION', '현재 출석할 수 있는 세션이 없어요.', 'REFRESH_SESSION');

  const reset = () => {
    locationCheckMutation.reset();
    attendanceMutation.reset();
    settingsMutation.reset();
  };
  const issue =
    [queryIssue, settingsIssue, locationIssue, submissionIssue, availabilityIssue].find(
      (candidate): candidate is AttendanceFlowError => candidate != null,
    ) ?? null;

  return {
    isPending,
    checkingLocation: locationCheckMutation.isPending,
    submittingAttendance: attendanceMutation.isPending,
    openingSettings: settingsMutation.isPending,
    disabled: !available || week.isFetching || !!week.error || isPending,
    issue,
    reset,
    refresh: () => {
      reset();
      void week.refetch();
    },
    openSettings: () => {
      settingsMutation.reset();
      settingsMutation.mutate();
    },
    submit: (code: string, onInvalidCode: (message: string) => void) => {
      if (!session || !available || isPending || !isSheetOpen) {
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
            attendanceMutation.mutate(attendanceRequest, {
              onSuccess: onComplete,
              onError: (error) => {
                if (getAttendanceErrorCode(error) === invalidAttendanceCode) {
                  onInvalidCode('출석 코드가 올바르지 않아요.');
                }
              },
            }),
        },
      );
    },
  };
}
