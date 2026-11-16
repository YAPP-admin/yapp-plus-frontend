/** 푸시 수신 번호가 바뀔 때 현재 화면 활성 상태에 맞춰 알림 목록을 갱신합니다. */
import { useQueryClient } from '@tanstack/react-query';
import { notificationRevisionSchema } from '@yapp-plus/app-bridge';
import { useEffect, useEffectEvent } from 'react';
import { invalidateAlertsForPush } from './alerts-query';

/**
 * 수신 번호 변경만 Query 캐시에 반영하고, 실행 시점의 화면 활성 여부는 Effect Event로 읽습니다.
 * 별도 브리지 구독·이전 번호 기록 없이 기존 React 구독을 재사용합니다.
 * 화면 전환은 수신 처리의 계기가 아니며, 숨겨진 목록의 복귀 조회는 기존 화면 훅이 담당합니다.
 */
export function usePushAlertsRefresh(revision: unknown, isAlertsActive: boolean) {
  const client = useQueryClient();
  const refreshAlertsForPush = useEffectEvent(() => {
    void invalidateAlertsForPush(client, isAlertsActive);
  });

  useEffect(() => {
    const parsed = notificationRevisionSchema.safeParse(revision);
    if (parsed.success && parsed.data > 0) {
      refreshAlertsForPush();
    }
  }, [revision]);
}
