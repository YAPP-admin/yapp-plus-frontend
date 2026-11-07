/** 공개 웹 진입점에서 실행 환경·응답 검증·통신 오류 변환을 확인한다. */

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getLocationPermission,
  requestCurrentLocation,
  openAppSettings,
  isNativeLocationEnvironment,
} from '../src/web';

const native = vi.hoisted(() => ({
  getLocationPermission: vi.fn<() => Promise<unknown>>(),
  requestCurrentLocation: vi.fn<() => Promise<unknown>>(),
  openAppSettings: vi.fn<() => Promise<unknown>>(),
}));
vi.mock('@webview-bridge/web', () => ({ linkBridge: () => native }));

const unavailable = { status: 'ERROR', code: 'LOCATION_UNAVAILABLE' };
const permission = {
  status: 'granted',
  canAskAgain: true,
  servicesEnabled: true,
  precision: 'precise',
};
const location = {
  latitude: 0,
  longitude: 0,
  accuracy: null,
  timestamp: 1,
  precision: 'approximate',
};
const methods = [
  {
    call: getLocationPermission,
    mock: native.getLocationPermission,
    result: { status: 'SUCCESS', permission },
  },
  {
    call: requestCurrentLocation,
    mock: native.requestCurrentLocation,
    result: { status: 'SUCCESS', location },
  },
  { call: openAppSettings, mock: native.openAppSettings, result: { status: 'SUCCESS' } },
];
const inApp = () => vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('위치 웹 도우미', () => {
  it.each([undefined, {}])(
    'SSR·일반 브라우저에서는 브리지를 호출하지 않는다 (%j)',
    async (windowValue) => {
      vi.stubGlobal('window', windowValue);
      expect(isNativeLocationEnvironment()).toBe(false);
      for (const method of methods) {
        expect(await method.call()).toEqual(unavailable);
        expect(method.mock).not.toHaveBeenCalled();
      }
    },
  );

  it.each(methods)(
    '성공 응답을 검증하고 추가 원문 필드를 제거한다 ($call.name)',
    async ({ call, mock, result }) => {
      inApp();
      mock.mockResolvedValue({ ...result, raw: '노출 금지' });
      expect(isNativeLocationEnvironment()).toBe(true);
      expect(await call()).toEqual(result);
    },
  );

  it.each(methods)(
    '네이티브 권한 오류의 재요청 여부를 보존한다 ($call.name)',
    async ({ call, mock }) => {
      inApp();
      mock.mockResolvedValue({
        status: 'ERROR',
        code: 'PERMISSION_DENIED',
        canAskAgain: false,
        message: '원문',
      });
      expect(await call()).toEqual({
        status: 'ERROR',
        code: 'PERMISSION_DENIED',
        canAskAgain: false,
      });
    },
  );

  it.each(methods)('통신 실패와 잘못된 응답을 정규화한다 ($call.name)', async ({ call, mock }) => {
    inApp();
    mock
      .mockRejectedValueOnce(new Error('원문 오류'))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ status: 'ERROR', code: 'UNKNOWN' });
    expect(await call()).toEqual(unavailable);
    expect(await call()).toEqual(unavailable);
    expect(await call()).toEqual(unavailable);
  });

  it('위치 필드가 잘못되면 성공으로 전달하지 않는다', async () => {
    inApp();
    native.requestCurrentLocation.mockResolvedValue({
      status: 'SUCCESS',
      location: { ...location, latitude: 91 },
    });
    expect(await requestCurrentLocation()).toEqual(unavailable);
  });
});
