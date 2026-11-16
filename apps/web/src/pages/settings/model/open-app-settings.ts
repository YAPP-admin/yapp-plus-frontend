/** OS 설정 실행 상태만 관리하며 알림 선택·권한 조회나 변경 상태를 조작하지 않습니다. */

import { useMutation } from '@tanstack/react-query';
import { openAppSettings } from '@yapp-plus/app-bridge/web';

/** 성공은 설정 창 실행만 뜻합니다. 권한 변경 여부는 복귀 후 별도 조회로 확인합니다. */
export function useOpenAppSettingsMutation() {
  return useMutation({
    mutationFn: openAppSettings,
    networkMode: 'always',
    retry: false,
  });
}
