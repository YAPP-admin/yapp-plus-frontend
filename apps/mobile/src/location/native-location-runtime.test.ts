/** Expo 응답을 공용 계약으로 변환하는 경계를 검증한다. 실제 OS 권한 팝업은 실기기 검증 대상이다. */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { watchPositionAsync, LocationObject, LocationSubscription } from 'expo-location';
import { locationActions } from './native-location-runtime';

const native = vi.hoisted(() => ({
  appState: { currentState: 'active' },
  permission: vi.fn<() => Promise<unknown>>(),
  request: vi.fn<() => Promise<unknown>>(),
  services: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
  watch: vi.fn<typeof watchPositionAsync>(),
  remove: vi.fn<() => void>(),
  settings: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));
vi.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  PermissionStatus: { GRANTED: 'granted' },
  getForegroundPermissionsAsync: native.permission,
  requestForegroundPermissionsAsync: native.request,
  hasServicesEnabledAsync: native.services,
  watchPositionAsync: native.watch,
}));
vi.mock('react-native', () => ({
  AppState: native.appState,
  Linking: { openSettings: native.settings },
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  native.appState.currentState = 'active';
  native.permission.mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    ios: { accuracy: 'full' },
  });
  native.services.mockResolvedValue(true);
  native.watch.mockResolvedValue({ remove: native.remove });
});

afterEach(() => {
  vi.useRealTimers();
});

const sample = (timestamp = Date.now()): LocationObject => ({
  coords: {
    latitude: 0,
    longitude: 0,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp,
});

const startMeasurement = async () => {
  const result = locationActions.requestCurrentLocation();
  await vi.advanceTimersByTimeAsync(0);
  const call = native.watch.mock.calls.at(-1);
  if (!call) {
    throw new Error('위치 구독이 시작되지 않았습니다.');
  }
  return { result, emit: call[1], fail: call[2] };
};

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
      native.watch.mockImplementation((_, emit) => {
        emit({ coords, timestamp: Date.now() + 0.5, mocked: true });
        return Promise.resolve({ remove: native.remove });
      });
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
      expect(native.watch).toHaveBeenCalledWith(
        { accuracy: 4, distanceInterval: 0 },
        expect.any(Function),
        expect.any(Function),
      );
      expect(native.remove).toHaveBeenCalledOnce();
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

describe('새 위치 표본 대기와 구독 정리', () => {
  it('요청 이전 표본을 무시하고 새 표본을 받으면 15초를 기다리지 않고 반환한다', async () => {
    const previous = sample(Date.now() - 1);
    const { result, emit } = await startMeasurement();
    emit(previous);
    expect(native.remove).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2_000);
    emit(sample());
    expect(await result).toMatchObject({ status: 'SUCCESS', location: { timestamp: Date.now() } });
    expect(native.remove).toHaveBeenCalledOnce();
  });

  it('요청 후 5초 지난 표본은 수집한다', async () => {
    const { result, emit } = await startMeasurement();
    const measured = sample();
    await vi.advanceTimersByTimeAsync(5_000);
    emit(measured);
    expect(await result).toMatchObject({
      status: 'SUCCESS',
      location: { timestamp: measured.timestamp },
    });
    expect(native.remove).toHaveBeenCalledOnce();
  });

  it('요청 후 5초를 초과한 표본은 무시하고 다음 표본을 기다린다', async () => {
    const { result, emit } = await startMeasurement();
    const measured = sample();
    await vi.advanceTimersByTimeAsync(5_001);
    emit(measured);
    emit(sample());
    expect(await result).toMatchObject({ status: 'SUCCESS', location: { timestamp: Date.now() } });
    expect(native.remove).toHaveBeenCalledOnce();
  });

  it('미래 시각 표본은 무시하고 유효한 다음 표본을 받는다', async () => {
    const { result, emit } = await startMeasurement();
    emit(sample(Date.now() + 1));
    expect(native.remove).not.toHaveBeenCalled();
    emit(sample());
    expect(await result).toMatchObject({ status: 'SUCCESS' });
  });

  it('오래된 표본이 반복돼도 15초 제한을 연장하지 않고 다음 요청을 허용한다', async () => {
    const previous = sample(Date.now() - 1);
    const first = await startMeasurement();
    for (let count = 0; count < 3; count++) {
      await vi.advanceTimersByTimeAsync(4_000);
      first.emit(previous);
    }
    await vi.advanceTimersByTimeAsync(3_000);
    expect(await first.result).toEqual({ status: 'ERROR', code: 'TIMEOUT' });
    expect(native.remove).toHaveBeenCalledOnce();
    const second = await startMeasurement();
    first.emit(sample());
    expect(native.remove).toHaveBeenCalledOnce();
    second.emit(sample());
    expect(await second.result).toMatchObject({ status: 'SUCCESS' });
    expect(native.remove).toHaveBeenCalledTimes(2);
  });

  it('시간 초과 뒤 생성된 구독도 해제한다', async () => {
    let finish!: (subscription: LocationSubscription) => void;
    native.watch.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result, emit } = await startMeasurement();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await result).toEqual({ status: 'ERROR', code: 'TIMEOUT' });
    expect(native.remove).not.toHaveBeenCalled();
    finish({ remove: native.remove });
    await vi.advanceTimersByTimeAsync(0);
    emit(sample());
    expect(native.remove).toHaveBeenCalledOnce();
  });

  it('구독 오류 시 수집을 정리하고 취득 실패를 반환한다', async () => {
    const { result, fail } = await startMeasurement();
    if (!fail) {
      throw new Error('위치 오류 콜백이 없습니다.');
    }
    fail('위치 제공자 오류');
    expect(await result).toEqual({ status: 'ERROR', code: 'LOCATION_UNAVAILABLE' });
    expect(native.remove).toHaveBeenCalledOnce();
  });

  it('구독 생성 실패 후 재시도할 수 있다', async () => {
    native.watch.mockRejectedValueOnce(new Error('구독 시작 실패'));
    expect(await locationActions.requestCurrentLocation()).toEqual({
      status: 'ERROR',
      code: 'LOCATION_UNAVAILABLE',
    });
    const { result, emit } = await startMeasurement();
    emit(sample());
    expect(await result).toMatchObject({ status: 'SUCCESS' });
  });
});
