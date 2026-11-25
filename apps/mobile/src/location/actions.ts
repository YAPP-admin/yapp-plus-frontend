/**
 * OS 어댑터를 통해 단발 위치 요청을 수행하고 결과를 공용 브리지 계약으로 변환한다.
 * 좌표를 저장하지 않으며 출석 판정과 웹 화면의 요청 상태는 호출자가 담당한다.
 */

import {
  locationSampleSchema,
  type LocationFailure,
  type LocationPermission,
  type LocationPermissionResult,
  type LocationResult,
  type LocationSample,
  type OpenAppSettingsResult,
} from '@yapp-plus/app-bridge';

/** OS 측정값. 권한 정밀도는 별도 권한 조회 결과에서 결합한다. */
export type LocationReading = Omit<LocationSample, 'precision'>;

/** OS 연결을 주입해 권한·요청 수명을 기기 없이 검증한다. */
export type LocationRuntime = {
  getPermission: () => Promise<LocationPermission>;
  requestPermission: () => Promise<LocationPermission>;
  isActive: () => boolean;
  isBackground: () => boolean;
  /** 요청 이후 측정한 5초 이내 표본 한 건을 반환하며 15초 안에 없으면 null을 반환한다. */
  getPosition: () => Promise<LocationReading | null>;
  openSettings: () => Promise<void>;
};

const error = (code: Exclude<LocationFailure['code'], 'PERMISSION_DENIED'>): LocationFailure => ({
  status: 'ERROR',
  code,
});

/** 권한이 필요하고 다시 요청할 수 있을 때만 OS 팝업을 연다. */
const resolvePermission = async (runtime: LocationRuntime): Promise<LocationPermission> => {
  const permission = await runtime.getPermission();

  return permission.status !== 'granted' && permission.canAskAgain
    ? runtime.requestPermission()
    : permission;
};

/** 측정 결과와 공용 응답 형식 검증을 묶는다. 측정 제한과 구독 정리는 OS 어댑터가 담당한다. */
const measureLocation = async (
  runtime: LocationRuntime,
  precision: LocationPermission['precision'],
): Promise<LocationResult> => {
  const reading = await runtime.getPosition();

  if (reading === null) {
    return error('TIMEOUT');
  }

  if (runtime.isBackground()) {
    return error('APP_INACTIVE');
  }

  const location = locationSampleSchema.safeParse({
    ...reading,
    accuracy:
      reading.accuracy !== null && Number.isFinite(reading.accuracy) && reading.accuracy < 0
        ? null
        : reading.accuracy,
    precision,
  });

  // 표본 신선도는 OS 어댑터에서 검사하고 이 경계에서는 공용 응답 형식을 검증한다.
  if (!location.success) {
    return error('LOCATION_UNAVAILABLE');
  }

  return { status: 'SUCCESS', location: location.data };
};

/**
 * OS 어댑터를 받아 예외를 브리지 실패 결과로 변환하는 작업을 생성한다.
 * 반환 함수는 클로저로 runtime과 busy를 공유하므로 분리해서 호출해도 잠금이 유지된다.
 * 앱에서는 한 번 생성해 재사용하며, 잠금은 이 인스턴스의 응답 대기 동안만 유효하다.
 */
export const createLocationActions = (runtime: LocationRuntime) => {
  let busy = false;

  /** 팝업 없이 권한을 조회한다. SUCCESS여도 권한이 거부된 상태일 수 있다. */
  const getLocationPermission = async (): Promise<LocationPermissionResult> => {
    try {
      return { status: 'SUCCESS', permission: await runtime.getPermission() };
    } catch {
      return error('LOCATION_UNAVAILABLE');
    }
  };

  /** 설정 실행 결과만 반환하며 복귀 감지나 자동 재측정은 하지 않는다. */
  const openAppSettings = async (): Promise<OpenAppSettingsResult> => {
    try {
      await runtime.openSettings();
      return { status: 'SUCCESS' };
    } catch {
      return error('LOCATION_UNAVAILABLE');
    }
  };

  /**
   * 필요하면 권한을 요청한 뒤 위치 한 건을 반환한다. 진행 중 재호출은 BUSY다.
   * 권한 선택에는 시간 제한이 없고, 측정 대기는 OS 어댑터가 15초로 제한하고 구독을 해제한다.
   */
  const requestCurrentLocation = async (): Promise<LocationResult> => {
    if (busy) {
      return error('BUSY');
    }

    if (!runtime.isActive()) {
      return error('APP_INACTIVE');
    }

    busy = true;

    try {
      const permission = await resolvePermission(runtime);

      if (permission.status !== 'granted') {
        return { status: 'ERROR', code: 'PERMISSION_DENIED', canAskAgain: permission.canAskAgain };
      }

      if (!permission.servicesEnabled) {
        return error('SERVICES_DISABLED');
      }

      if (runtime.isBackground()) {
        return error('APP_INACTIVE');
      }

      return await measureLocation(runtime, permission.precision);
    } catch {
      return error('LOCATION_UNAVAILABLE');
    } finally {
      busy = false;
    }
  };

  return { getLocationPermission, requestCurrentLocation, openAppSettings };
};
