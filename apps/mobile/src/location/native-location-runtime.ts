/**
 * iOS의 Expo Location·AppState·Linking을 위치 작업에 연결하는 네이티브 경계다.
 * OS 객체에서 계약에 필요한 필드만 전달하며 백그라운드 위치 권한은 요청하지 않는다.
 */

import type { LocationPermission, LocationPrecision } from '@yapp-plus/app-bridge';
import * as Location from 'expo-location';
import { AppState, Linking } from 'react-native';

import { createLocationActions } from './actions';

const precisionByAccuracy: Record<'full' | 'reduced', LocationPrecision> = {
  full: 'precise',
  reduced: 'approximate',
};

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

/** 브리지 호출 전체가 같은 중복 요청 잠금을 사용하도록 모듈 수명 동안 재사용한다. */
export const locationActions = createLocationActions({
  getPermission: () => readPermission(Location.getForegroundPermissionsAsync),
  requestPermission: () => readPermission(Location.requestForegroundPermissionsAsync),
  isActive: () => AppState.currentState === 'active',
  getPosition: async () => {
    const { coords, timestamp } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp,
    };
  },
  openSettings: () => Linking.openSettings(),
});
