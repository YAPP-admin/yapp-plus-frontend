/** 현재 위치와 세션 좌표를 검증·계산해 출석 가능 여부만 반환하며 원문 위치는 보존하지 않습니다. */
import { locationSampleSchema, type LocationSample } from '@yapp-plus/app-bridge';
import { getPreciseDistance } from 'geolib';

const MAX_LOCATION_ACCURACY_METERS = 50;
const MAX_ATTENDANCE_DISTANCE_METERS = 100;
const attendanceCoordinatesSchema = locationSampleSchema.pick({
  latitude: true,
  longitude: true,
});
const attendanceLocationInputSchema = locationSampleSchema.omit({ timestamp: true });

type AttendanceCoordinates = Readonly<{
  latitude: number;
  longitude: number;
}>;

/** nullable 서버 좌표를 포함하는 출석 대상 위치입니다. */
export type AttendanceSessionLocation = Readonly<{
  latitude: number | null;
  longitude: number | null;
}>;

/** 브리지에서 신선도 검증을 마친 위치 표본 중 출석 판정에 필요한 필드입니다. */
export type AttendanceLocationInput = Omit<LocationSample, 'timestamp'>;

/** 유효한 위치를 확인했지만 출석 정책상 제출을 막는 사유입니다. */
export type LocationAttendanceBlockReason =
  | 'PRECISE_LOCATION_REQUIRED'
  | 'LOCATION_ACCURACY_UNAVAILABLE'
  | 'LOCATION_ACCURACY_TOO_LOW'
  | 'OUT_OF_RANGE';

/** 입력 계약이나 거리 계산 문제로 출석 가능 여부를 판정하지 못한 사유입니다. */
export type LocationAttendanceUnavailableReason =
  | 'INVALID_SESSION_LOCATION'
  | 'INVALID_CURRENT_LOCATION'
  | 'DISTANCE_UNAVAILABLE';

/** 좌표와 거리를 노출하지 않고 허용·정책 차단·판정 불가만 전달하는 결과입니다. */
export type LocationAttendanceResult =
  | Readonly<{ status: 'ALLOWED' }>
  | Readonly<{ status: 'BLOCKED'; reason: LocationAttendanceBlockReason }>
  | Readonly<{ status: 'UNAVAILABLE'; reason: LocationAttendanceUnavailableReason }>;

type AttendanceLocationInputValidationResult =
  | Readonly<{
      success: true;
      currentLocation: AttendanceLocationInput;
      sessionLocation: AttendanceCoordinates;
    }>
  | Readonly<{ success: false; reason: LocationAttendanceUnavailableReason }>;

type AttendanceDistanceResult =
  | Readonly<{ success: true; distance: number }>
  | Readonly<{ success: false }>;

const createBlockedResult = (reason: LocationAttendanceBlockReason): LocationAttendanceResult => ({
  status: 'BLOCKED',
  reason,
});

const createUnavailableResult = (
  reason: LocationAttendanceUnavailableReason,
): LocationAttendanceResult => ({ status: 'UNAVAILABLE', reason });

/**
 * 서버 세션 좌표와 브리지 위치 입력을 각각의 신뢰 경계 스키마로 검증합니다.
 *
 * @param currentLocation 브리지 위치 결과에서 신선도 검증을 마친 현재 위치입니다.
 * @param sessionLocation 서버가 제공한 nullable 세션 좌표입니다.
 * @returns 두 입력이 모두 유효하면 정규화된 좌표를, 그렇지 않으면 원문 없이 판정 불가 사유를 반환합니다.
 */
function validateAttendanceLocationInputs(
  currentLocation: AttendanceLocationInput,
  sessionLocation: AttendanceSessionLocation,
): AttendanceLocationInputValidationResult {
  const parsedSessionLocation = attendanceCoordinatesSchema.safeParse(sessionLocation);
  if (!parsedSessionLocation.success) {
    return { success: false, reason: 'INVALID_SESSION_LOCATION' };
  }

  const parsedCurrentLocation = attendanceLocationInputSchema.safeParse(currentLocation);
  if (!parsedCurrentLocation.success) {
    return { success: false, reason: 'INVALID_CURRENT_LOCATION' };
  }

  return {
    success: true,
    currentLocation: parsedCurrentLocation.data,
    sessionLocation: parsedSessionLocation.data,
  };
}

/**
 * 검증된 현재 위치가 정밀 권한과 최대 50m 오차 정책을 충족하는지 확인합니다.
 *
 * @param currentLocation 신뢰 경계 스키마를 통과한 현재 위치입니다.
 * @returns 정책상 제출을 막아야 하면 사유를, 거리 계산을 진행할 수 있으면 `null`을 반환합니다.
 */
function getLocationPolicyBlockReason(
  currentLocation: AttendanceLocationInput,
): LocationAttendanceBlockReason | null {
  if (currentLocation.precision !== 'precise') {
    return 'PRECISE_LOCATION_REQUIRED';
  }
  if (currentLocation.accuracy === null) {
    return 'LOCATION_ACCURACY_UNAVAILABLE';
  }
  if (currentLocation.accuracy > MAX_LOCATION_ACCURACY_METERS) {
    return 'LOCATION_ACCURACY_TOO_LOW';
  }
  return null;
}

/**
 * 검증된 두 좌표 사이의 타원체 거리를 반올림 없이 미터 단위로 계산합니다.
 *
 * @param currentLocation 검증된 현재 위치 좌표입니다.
 * @param sessionLocation 검증된 세션 장소 좌표입니다.
 * @returns 유한한 0 이상 거리 또는 Vincenty 계산 비수렴을 나타내는 실패 결과를 반환합니다.
 */
function calculateAttendanceDistance(
  currentLocation: AttendanceCoordinates,
  sessionLocation: AttendanceCoordinates,
): AttendanceDistanceResult {
  const distance = getPreciseDistance(currentLocation, sessionLocation, 0);

  return Number.isFinite(distance) && distance >= 0
    ? { success: true, distance }
    : { success: false };
}

/**
 * 계산된 거리가 출석 허용 반경인 100m 이내인지 판정합니다.
 *
 * @param distance 반올림하지 않은 미터 단위 거리입니다.
 * @returns 유한한 0 이상 거리이면서 100m 경계를 포함할 때만 `true`를 반환합니다.
 */
export const isAttendanceDistanceAllowed = (distance: number): boolean =>
  Number.isFinite(distance) && distance >= 0 && distance <= MAX_ATTENDANCE_DISTANCE_METERS;

/**
 * 현재 위치가 세션 장소의 출석 조건을 충족하는지 일회성으로 판정합니다.
 *
 * 입력 계약이나 거리 계산 문제는 `UNAVAILABLE`, 정밀 권한·오차·반경 정책 위반은 `BLOCKED`로
 * 구분합니다. 모든 실패 결과는 코드 제출을 막으며 좌표와 계산 거리를 포함하지 않습니다.
 *
 * @param currentLocation 브리지 위치 결과에서 신선도 검증을 마친 현재 위치입니다.
 * @param sessionLocation 출석 대상 세션의 nullable 장소 좌표입니다.
 * @returns 출석 허용 여부와 화면이 복구 행동으로 변환할 수 있는 정규화된 사유를 반환합니다.
 */
export function assessAttendanceLocation(
  currentLocation: AttendanceLocationInput,
  sessionLocation: AttendanceSessionLocation,
): LocationAttendanceResult {
  const validatedInputs = validateAttendanceLocationInputs(currentLocation, sessionLocation);
  if (!validatedInputs.success) {
    return createUnavailableResult(validatedInputs.reason);
  }

  const blockReason = getLocationPolicyBlockReason(validatedInputs.currentLocation);
  if (blockReason !== null) {
    return createBlockedResult(blockReason);
  }

  const distanceResult = calculateAttendanceDistance(
    validatedInputs.currentLocation,
    validatedInputs.sessionLocation,
  );
  if (!distanceResult.success) {
    return createUnavailableResult('DISTANCE_UNAVAILABLE');
  }

  return isAttendanceDistanceAllowed(distanceResult.distance)
    ? { status: 'ALLOWED' }
    : createBlockedResult('OUT_OF_RANGE');
}
