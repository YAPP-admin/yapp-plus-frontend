/** 위치 RPC 응답을 공용 스키마로 검증하는 웹 경계다. 좌표를 캐시하거나 기록하지 않는다. */

import type { z } from 'zod';
import type { AppBridgeState } from './index';
import {
  locationPermissionResultSchema,
  locationResultSchema,
  openAppSettingsResultSchema,
  type LocationFailure,
} from './location';

type LocationBridge = Pick<
  AppBridgeState,
  'getLocationPermission' | 'requestCurrentLocation' | 'openAppSettings'
>;

/** 실행 환경만 판별한다. 구버전 앱의 메서드 지원이나 위치 권한을 검사하지 않는다. */
export const isNativeLocationEnvironment = (): boolean =>
  typeof window !== 'undefined' && 'ReactNativeWebView' in window;

/** 연결 함수를 주입해 브리지를 호출 시점에 얻는다. 일반 브라우저·SSR에서는 연결하지 않는다. */
export const createWebLocationActions = (getBridge: () => LocationBridge) => {
  const call = async <T>(
    request: (bridge: LocationBridge) => Promise<unknown>,
    schema: z.ZodType<T>,
  ): Promise<T | LocationFailure> => {
    const unavailable: LocationFailure = { status: 'ERROR', code: 'LOCATION_UNAVAILABLE' };
    if (!isNativeLocationEnvironment()) {
      return unavailable;
    }

    try {
      const result = schema.safeParse(await request(getBridge()));
      return result.success ? result.data : unavailable;
    } catch {
      return unavailable;
    }
  };

  return {
    /** 팝업 없이 현재 권한·서비스 상태를 조회한다. 조회 성공이 권한 허용을 뜻하지 않는다. */
    getLocationPermission: () =>
      call((bridge) => bridge.getLocationPermission(), locationPermissionResultSchema),
    /** 위치 한 건을 반환한다. 화면 이탈 후 결과를 무시하는 책임은 호출자에게 있다. */
    requestCurrentLocation: () =>
      call((bridge) => bridge.requestCurrentLocation(), locationResultSchema),
    /** 앱 설정 실행만 요청한다. 복귀 후 권한은 별도로 다시 조회해야 한다. */
    openAppSettings: () => call((bridge) => bridge.openAppSettings(), openAppSettingsResultSchema),
  };
};
