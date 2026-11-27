/**
 * iOS의 Expo Location·AppState·Linking을 위치 작업에 연결하는 네이티브 경계다.
 * OS 객체에서 계약에 필요한 필드만 전달하며 백그라운드 위치 권한은 요청하지 않는다.
 */

import type { LocationPermission, LocationPrecision } from '@yapp-plus/app-bridge';
import * as Location from 'expo-location';
import { AppState, Linking } from 'react-native';

import { createLocationActions, type LocationReading } from './actions';

const precisionByAccuracy: Record<'full' | 'reduced', LocationPrecision> = {
  full: 'precise',
  reduced: 'approximate',
};
const LOCATION_MEASUREMENT_TIMEOUT_MS = 15_000;
const MAX_LOCATION_SAMPLE_AGE_MS = 5_000;

/** 플랫폼 권한을 공통 계약으로 바꾸되 원본 OS 객체는 브리지로 넘기지 않는다. */
const readPermission = async (
  request: () => Promise<Location.LocationPermissionResponse>,
): Promise<LocationPermission> => {
  const permission = await request();
  const accuracy = permission.ios?.accuracy;
  const precision =
    permission.status === Location.PermissionStatus.GRANTED && accuracy
      ? precisionByAccuracy[accuracy]
      : 'unknown';

  return {
    status: permission.status,
    canAskAgain: permission.canAskAgain,
    precision,
    servicesEnabled: await Location.hasServicesEnabledAsync(),
  };
};

/** 새 표본 한 건을 받을 때까지만 구독하며 15초 안에 없으면 구독을 정리한다. */
const getFreshPosition = async (): Promise<LocationReading | null> => {
  const measurementStartedAt = Date.now();
  let activeLocationSubscription: Location.LocationSubscription | undefined;
  let isMeasurementComplete = false;
  let measurementTimeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await new Promise((resolve, reject) => {
      const completePositionMeasurement = (result: LocationReading | null) => {
        if (isMeasurementComplete) {
          return;
        }
        isMeasurementComplete = true;
        resolve(result);
      };
      const failPositionMeasurement = (reason: unknown) => {
        if (isMeasurementComplete) {
          return;
        }
        isMeasurementComplete = true;
        reject(reason instanceof Error ? reason : new Error('위치 수집을 완료하지 못했습니다.'));
      };

      const beginLocationSubscription = async () => {
        try {
          const locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 0 },
            ({ coords, timestamp: sampleCapturedAt }) => {
              // iOS의 소수 밀리초를 공용 계약의 정수 밀리초로 정규화한 뒤 신선도를 비교한다.
              const timestamp = Math.trunc(sampleCapturedAt);
              const sampleAge = Date.now() - timestamp;
              if (
                timestamp < measurementStartedAt ||
                sampleAge < 0 ||
                sampleAge > MAX_LOCATION_SAMPLE_AGE_MS
              ) {
                return;
              }

              completePositionMeasurement({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                timestamp,
              });
            },
            failPositionMeasurement,
          );
          // 위치 표본이 구독 Promise보다 먼저 도착할 수 있다.
          if (isMeasurementComplete) {
            locationSubscription.remove();
          } else {
            activeLocationSubscription = locationSubscription;
          }
        } catch (reason) {
          failPositionMeasurement(reason);
        }
      };

      measurementTimeout = setTimeout(
        () => completePositionMeasurement(null),
        LOCATION_MEASUREMENT_TIMEOUT_MS,
      );
      void beginLocationSubscription();
    });
  } finally {
    clearTimeout(measurementTimeout);
    activeLocationSubscription?.remove();
  }
};

/** 브리지 호출 전체가 같은 중복 요청 잠금을 사용하도록 모듈 수명 동안 재사용한다. */
export const locationActions = createLocationActions({
  getPermission: () => readPermission(Location.getForegroundPermissionsAsync),
  requestPermission: () => readPermission(Location.requestForegroundPermissionsAsync),
  isActive: () => AppState.currentState === 'active',
  // 권한 팝업이 닫힐 때의 일시적 inactive는 앱 이탈이 아니다.
  isBackground: () => AppState.currentState === 'background',
  getPosition: getFreshPosition,
  openSettings: () => Linking.openSettings(),
});
