/** 주입한 OS 어댑터로 단발 위치 정책과 요청 수명을 검증한다. 실제 GPS 동작은 검증하지 않는다. */

import type { LocationPermission } from '@yapp-plus/app-bridge';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocationActions, type LocationRuntime, type LocationReading } from './actions';

const granted: LocationPermission = {
  status: 'granted',
  canAskAgain: true,
  precision: 'precise',
  servicesEnabled: true,
};
const reading = (): LocationReading => ({
  latitude: 0,
  longitude: 0,
  accuracy: 10,
  timestamp: Date.now(),
});
const failure = (code: string) => ({ status: 'ERROR', code });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const setup = () => {
  const runtime = {
    getPermission: vi.fn<LocationRuntime['getPermission']>().mockResolvedValue(granted),
    requestPermission: vi.fn<LocationRuntime['requestPermission']>().mockResolvedValue(granted),
    isActive: vi.fn<LocationRuntime['isActive']>(() => true),
    getPosition: vi
      .fn<LocationRuntime['getPosition']>()
      .mockImplementation(() => Promise.resolve(reading())),
    openSettings: vi.fn<LocationRuntime['openSettings']>().mockResolvedValue(undefined),
  };
  return { runtime, actions: createLocationActions(runtime) };
};
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('네이티브 단발 위치 요청', () => {
  it.each([10, 200, null, -1])('오차 %s를 정규화해 전달한다', async (accuracy) => {
    const { runtime, actions } = setup();
    const sample = { ...reading(), accuracy };
    runtime.getPosition.mockResolvedValue(sample);
    expect(await actions.requestCurrentLocation()).toEqual({
      status: 'SUCCESS',
      location: { ...sample, accuracy: accuracy === -1 ? null : accuracy, precision: 'precise' },
    });
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([NaN, Infinity, -Infinity])('잘못된 오차 %s를 거부한다', async (accuracy) => {
    const { runtime, actions } = setup();
    runtime.getPosition.mockResolvedValue({ ...reading(), accuracy });
    expect(await actions.requestCurrentLocation()).toEqual(failure('LOCATION_UNAVAILABLE'));
  });
  it('오래된 위치를 성공 처리하지 않는다', async () => {
    const { runtime, actions } = setup();
    runtime.getPosition.mockResolvedValue({ ...reading(), timestamp: Date.now() - 1 });
    expect(await actions.requestCurrentLocation()).toEqual(failure('LOCATION_UNAVAILABLE'));
  });
  it.each(['resolve', 'reject'] as const)(
    '15초 뒤 재시도를 허용하고 이전 요청의 늦은 %s를 무시한다',
    async (end) => {
      const { runtime, actions } = setup();
      const old = deferred<LocationReading>();
      const next = deferred<LocationReading>();
      runtime.getPosition.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
      const first = actions.requestCurrentLocation();
      expect(await actions.requestCurrentLocation()).toEqual(failure('BUSY'));
      await vi.advanceTimersByTimeAsync(15_000);
      expect(await first).toEqual(failure('TIMEOUT'));
      const second = actions.requestCurrentLocation();
      await vi.advanceTimersByTimeAsync(0);
      if (end === 'resolve') {
        old.resolve(reading());
      } else {
        old.reject(new Error('이전 측정 실패'));
      }
      await vi.advanceTimersByTimeAsync(0);
      expect(await actions.requestCurrentLocation()).toEqual(failure('BUSY'));
      next.resolve({ ...reading(), latitude: 1 });
      expect(await second).toMatchObject({ status: 'SUCCESS', location: { latitude: 1 } });
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it('권한 선택 중에는 시간 제한 없이 중복 요청을 막는다', async () => {
    const { runtime, actions } = setup();
    const pending = deferred<LocationPermission>();
    runtime.getPermission.mockResolvedValue({ ...granted, status: 'undetermined' });
    runtime.requestPermission.mockReturnValue(pending.promise);
    const result = actions.requestCurrentLocation();
    await vi.advanceTimersByTimeAsync(180_000);
    expect(runtime.getPosition).not.toHaveBeenCalled();
    expect(await actions.requestCurrentLocation()).toEqual(failure('BUSY'));
    pending.resolve({ ...granted, precision: 'approximate' });
    expect(await result).toMatchObject({
      status: 'SUCCESS',
      location: { precision: 'approximate' },
    });
  });
  it.each([0, 1, 2])('시작·권한 확인 후·위치 반환 시 비활성 상태(%s)를 거부한다', async (index) => {
    const { runtime, actions } = setup();
    let calls = 0;
    runtime.isActive.mockImplementation(() => calls++ !== index);
    expect(await actions.requestCurrentLocation()).toEqual(failure('APP_INACTIVE'));
    expect(runtime.getPosition).toHaveBeenCalledTimes(index === 2 ? 1 : 0);
  });
  it.each(['getPermission', 'requestPermission', 'getPosition'] as const)(
    '%s 실패 후 잠금을 해제한다',
    async (method) => {
      const { runtime, actions } = setup();
      if (method === 'requestPermission') {
        runtime.getPermission.mockResolvedValue({ ...granted, status: 'undetermined' });
      }
      runtime[method].mockRejectedValueOnce(new Error('원문 오류'));
      expect(await actions.requestCurrentLocation()).toEqual(failure('LOCATION_UNAVAILABLE'));
      expect(await actions.requestCurrentLocation()).toMatchObject({ status: 'SUCCESS' });
      expect(vi.getTimerCount()).toBe(0);
    },
  );
});

describe('권한·설정', () => {
  it.each([true, false])('권한 거부 시 재요청 가능 여부 %s를 따른다', async (canAskAgain) => {
    const { runtime, actions } = setup();
    const permission: LocationPermission = { ...granted, status: 'denied', canAskAgain };
    runtime.getPermission.mockResolvedValue(permission);
    runtime.requestPermission.mockResolvedValue(permission);
    expect(await actions.getLocationPermission()).toEqual({ status: 'SUCCESS', permission });
    expect(runtime.requestPermission).not.toHaveBeenCalled();
    expect(await actions.requestCurrentLocation()).toEqual({
      ...failure('PERMISSION_DENIED'),
      canAskAgain,
    });
    expect(runtime.requestPermission).toHaveBeenCalledTimes(canAskAgain ? 1 : 0);
    expect(runtime.getPosition).not.toHaveBeenCalled();
  });
  it('위치 서비스가 꺼져 있으면 측정하지 않는다', async () => {
    const { runtime, actions } = setup();
    runtime.getPermission.mockResolvedValue({ ...granted, servicesEnabled: false });
    expect(await actions.requestCurrentLocation()).toEqual(failure('SERVICES_DISABLED'));
    expect(runtime.getPosition).not.toHaveBeenCalled();
  });
  it('권한 조회·설정 실패를 정규화하고 설정 실행만으로 재측정하지 않는다', async () => {
    const { runtime, actions } = setup();
    runtime.getPermission.mockRejectedValue(new Error('원문 오류'));
    expect(await actions.getLocationPermission()).toEqual(failure('LOCATION_UNAVAILABLE'));
    expect(await actions.openAppSettings()).toEqual({ status: 'SUCCESS' });
    runtime.openSettings.mockRejectedValue(new Error('원문 오류'));
    expect(await actions.openAppSettings()).toEqual(failure('LOCATION_UNAVAILABLE'));
    expect(runtime.getPosition).not.toHaveBeenCalled();
  });
});
