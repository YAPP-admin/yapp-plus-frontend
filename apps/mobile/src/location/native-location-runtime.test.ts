/** Expo 응답을 공용 계약으로 변환하는 경계를 검증한다. 실제 OS 권한 팝업은 실기기 검증 대상이다. */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { getCurrentPositionAsync } from 'expo-location';
import { locationActions } from './native-location-runtime';

const native = vi.hoisted(() => ({
  appState: { currentState: 'active' },
  permission: vi.fn<() => Promise<unknown>>(),
  request: vi.fn<() => Promise<unknown>>(),
  services: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
  position: vi.fn<typeof getCurrentPositionAsync>(),
  settings: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));
vi.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  PermissionStatus: { GRANTED: 'granted' },
  getForegroundPermissionsAsync: native.permission,
  requestForegroundPermissionsAsync: native.request,
  hasServicesEnabledAsync: native.services,
  getCurrentPositionAsync: native.position,
}));
vi.mock('react-native', () => ({
  AppState: native.appState,
  Linking: { openSettings: native.settings },
}));

afterEach(() => {
  vi.resetAllMocks();
  native.appState.currentState = 'active';
  vi.useRealTimers();
});

describe('Expo 위치 어댑터', () => {
  it.each(['active', 'inactive'])(
    '권한 팝업 이후 %s에서 실제 background만 차단한다',
    async (state) => {
      vi.useFakeTimers();
      native.permission.mockResolvedValue({ status: 'undetermined', canAskAgain: true });
      native.request.mockImplementation(() => {
        native.appState.currentState = state;
        return Promise.resolve({ status: 'granted', canAskAgain: true, ios: { accuracy: 'full' } });
      });
      native.services.mockResolvedValue(true);
      const coords = {
        latitude: 0,
        longitude: 0,
        accuracy: 200,
        altitude: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      };
      native.position.mockImplementation(() =>
        Promise.resolve({ coords, timestamp: Date.now() + 0.5, mocked: true }),
      );
      const result = await locationActions.requestCurrentLocation();
      expect(result).toEqual({
        status: 'SUCCESS',
        location: {
          latitude: 0,
          longitude: 0,
          accuracy: 200,
          timestamp: Date.now(),
          precision: 'precise',
        },
      });
      expect(native.position).toHaveBeenCalledWith({ accuracy: 4 });
    },
  );

  it.each([
    [{ ios: { accuracy: 'full' } }, 'precise'],
    [{ ios: { accuracy: 'reduced' } }, 'approximate'],
    [{}, 'unknown'],
  ])('iOS 정밀 권한 %j을 %s로 변환한다', async (details, precision) => {
    native.permission.mockResolvedValue({ status: 'granted', canAskAgain: true, ...details });
    native.services.mockResolvedValue(true);
    expect(await locationActions.getLocationPermission()).toEqual({
      status: 'SUCCESS',
      permission: { status: 'granted', canAskAgain: true, precision, servicesEnabled: true },
    });
    expect(native.request).not.toHaveBeenCalled();
  });

  it('거부 상태에서는 정밀도를 unknown으로 전달한다', async () => {
    native.permission.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
      ios: { accuracy: 'full' },
    });
    native.services.mockResolvedValue(false);
    expect(await locationActions.getLocationPermission()).toMatchObject({
      status: 'SUCCESS',
      permission: { precision: 'unknown', servicesEnabled: false },
    });
  });
});
