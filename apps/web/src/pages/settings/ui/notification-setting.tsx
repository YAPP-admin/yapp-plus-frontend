/** 설정 화면의 알림 선택·OS 권한·복구 행동을 표시합니다. 실제 저장은 네이티브가 소유합니다. */

import { useId } from 'react';
import {
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  SwitchThumb,
  VStack,
} from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { useOpenAppSettingsMutation } from '../model/open-app-settings';
import { useNotificationSettings } from '../model/notification-settings';
import {
  menuItem,
  menuLabel,
  switchControl,
  switchRoot,
  switchThumb,
  notificationHint,
} from './settings-page.css';

/** 조회 전에는 선택을 확정하지 않으며 변경 실패 시 이전 체크 상태와 재시도를 제공합니다. */
export function NotificationSetting() {
  const descriptionId = useId();
  const { query, mutation, failure } = useNotificationSettings();
  const settingsMutation = useOpenAppSettingsMutation();

  const unsupported = failure?.code === 'UNSUPPORTED';

  // 권한 안내는 복귀 후 조회한 현재 OS 상태를 기준으로 합니다.
  const denied = query.data?.permission === 'denied';

  const getMessage = () => {
    if (denied) {
      return '시스템에서 알림이 꺼져 있어요. 시스템 설정에서 허용해 주세요.';
    }

    if (unsupported || failure?.code === 'PERMISSION_REQUIRED') {
      return null;
    }

    if (mutation.isError) {
      return '변경하지 못했어요. 다시 시도해 주세요.';
    }

    return query.isError ? '알림 설정을 불러오지 못했어요.' : null;
  };
  const message = getMessage();

  return (
    <VStack width="full" align="stretch" gap="x2">
      <div className={menuItem}>
        <span className={menuLabel}>알림</span>
        {!query.data && failure?.retryable ? (
          <ActionButton
            type="button"
            size="small"
            variant="neutralWeak"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            알림 설정 다시 불러오기
          </ActionButton>
        ) : (
          <SwitchRoot
            className={switchRoot}
            checked={query.data?.enabled ?? false}
            disabled={!query.data || unsupported || mutation.isPending}
            onCheckedChange={(enabled) => mutation.mutate(enabled)}
          >
            <SwitchHiddenInput
              aria-label="알림"
              aria-describedby={message ? descriptionId : undefined}
            />
            <SwitchControl className={switchControl}>
              <SwitchThumb className={switchThumb} />
            </SwitchControl>
          </SwitchRoot>
        )}
      </div>

      {message && (
        <output id={descriptionId} className={notificationHint}>
          {message}
        </output>
      )}

      {mutation.isError && failure?.retryable && (
        <ActionButton
          type="button"
          size="small"
          variant="neutralWeak"
          onClick={() => mutation.mutate(mutation.variables)}
        >
          알림 변경 다시 시도
        </ActionButton>
      )}

      {denied && (
        <ActionButton
          type="button"
          size="small"
          variant="neutralWeak"
          disabled={settingsMutation.isPending}
          onClick={() => settingsMutation.mutate()}
        >
          시스템 설정 열기
        </ActionButton>
      )}

      {(settingsMutation.isError || settingsMutation.data?.status === 'ERROR') && (
        <p className={notificationHint} role="alert">
          시스템 설정을 열지 못했어요. 다시 시도해 주세요.
        </p>
      )}
    </VStack>
  );
}
