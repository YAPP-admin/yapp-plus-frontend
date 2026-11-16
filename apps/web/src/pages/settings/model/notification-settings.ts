/** 설치별 알림 설정을 브리지에서 읽고, 서버 반영에 성공한 선택만 Query에 저장합니다. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActivity } from '@stackflow/react';
import { useNativeAuthSession } from '@/features/auth';
import { getNotificationSettings, setNotificationEnabled } from '@yapp-plus/app-bridge/web';
import type { NotificationFailure, NotificationSettingsResult } from '@yapp-plus/app-bridge';

class SettingsError extends Error {
  constructor(readonly failure: NotificationFailure) {
    super(failure.code);
  }
}

function requireSuccess(result: NotificationSettingsResult) {
  if (result.status === 'ERROR') {
    throw new SettingsError(result);
  }

  return result;
}

/** 화면 활성화·앱 복귀 시 재조회하며 변경 실패는 마지막 성공값을 유지합니다. */
export function useNotificationSettings() {
  const client = useQueryClient();
  const { session } = useNativeAuthSession();
  const { isActive } = useActivity();

  const queryKey = ['notification-settings', session?.userId, session?.sessionId];

  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: async (enabled: boolean) =>
      requireSuccess(await setNotificationEnabled({ enabled })),
    onMutate: async () => {
      await client.cancelQueries({ queryKey, exact: true });
    },
    onSuccess: (data) => {
      // 계정 경계에서 제거한 캐시를 늦은 변경 응답으로 다시 만들지 않습니다.
      if (client.getQueryState(queryKey)) {
        client.setQueryData(queryKey, data);
      }
    },
    networkMode: 'always',
    retry: false,
  });

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const result = await getNotificationSettings();
      signal.throwIfAborted();

      return requireSuccess(result);
    },
    enabled: isActive && !mutation.isPending,
    retry: false,
    networkMode: 'always',
    staleTime: 0,
    refetchOnWindowFocus: 'always',
  });

  const error = mutation.error ?? query.error;

  return {
    query,
    mutation,
    failure: error instanceof SettingsError ? error.failure : undefined,
  };
}
