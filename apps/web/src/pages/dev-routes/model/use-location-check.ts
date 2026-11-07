/** 개발 도구의 요청 상태만 관리한다. 좌표는 문자열 상태로 바꾼 뒤 폐기해 Query 캐시에 넣지 않는다. */

import { useMutation } from '@tanstack/react-query';
import type { LocationFailure, LocationPrecision } from '@yapp-plus/app-bridge';
import {
  getLocationPermission,
  requestCurrentLocation,
  openAppSettings,
} from '@yapp-plus/app-bridge/web';

export type LocationCheckOperation = 'permission' | 'location' | 'settings';

const precisionLabels: Record<LocationPrecision, string> = {
  precise: '정확한 위치',
  approximate: '대략적인 위치',
  unknown: '미확인',
};

/** OS 원문 대신 복구 행동을 안내한다. 권한 거부는 재요청 가능 여부를 구분한다. */
const describeFailure = (result: LocationFailure): string => {
  if (result.code === 'PERMISSION_DENIED') {
    return result.canAskAgain
      ? '권한이 거부되었습니다. 위치 요청을 다시 시도할 수 있습니다.'
      : '권한이 거부되었습니다. 앱 설정에서 위치 권한을 허용해 주세요.';
  }

  const messages = {
    SERVICES_DISABLED: '기기 위치 서비스를 켜 주세요.',
    TIMEOUT: '위치 응답 대기 시간이 지났습니다. 다시 시도해 주세요.',
    BUSY: '앱에서 이전 요청을 처리 중입니다. 잠시 후 다시 시도해 주세요.',
    APP_INACTIVE: '앱을 화면에 연 상태에서 다시 시도해 주세요.',
    LOCATION_UNAVAILABLE: '요청을 완료하지 못했습니다. 앱 연결과 설정을 확인해 주세요.',
  };
  return messages[result.code];
};

/** 반환값에는 좌표·측정 시각·원문 오류가 포함되지 않는다. */
const runLocationCheck = async (operation: LocationCheckOperation): Promise<string> => {
  switch (operation) {
    case 'permission': {
      const result = await getLocationPermission();
      if (result.status === 'ERROR') {
        return describeFailure(result);
      }

      const { permission } = result;
      const status = { granted: '허용', denied: '거부', undetermined: '미결정' };
      return `권한: ${status[permission.status]} · 정밀 권한: ${precisionLabels[permission.precision]} · 위치 서비스: ${permission.servicesEnabled ? '켜짐' : '꺼짐'} · 재요청: ${permission.canAskAgain ? '가능' : '불가'}`;
    }
    case 'location': {
      const result = await requestCurrentLocation();
      return result.status === 'ERROR'
        ? describeFailure(result)
        : `위치 수신 성공 · 정밀 권한: ${precisionLabels[result.location.precision]}`;
    }
    case 'settings': {
      const result = await openAppSettings();
      return result.status === 'ERROR'
        ? describeFailure(result)
        : '앱 설정을 열었습니다. 돌아온 뒤 권한을 다시 조회해 주세요.';
    }
  }

  throw new Error('알 수 없는 위치 검증 작업입니다.');
};

/** 화면이 사라지면 observer가 분리된다. 새 진입에서는 이전 요청 결과를 재사용하지 않는다. */
export const useLocationCheck = () =>
  useMutation({
    mutationFn: runLocationCheck,
    retry: false,
    networkMode: 'always',
    gcTime: 0,
  });
