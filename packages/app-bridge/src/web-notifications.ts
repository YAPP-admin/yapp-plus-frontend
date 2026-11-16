/** 웹의 알림 RPC 경계에서 실행 환경·메서드 지원·응답을 검증합니다. */
import type { z } from 'zod';
import type { AppBridgeState } from './index';
import {
  notificationFailure,
  notificationSettingsResultSchema,
  notificationPermissionResultSchema,
  setNotificationEnabledInputSchema,
  type NotificationFailure,
  type SetNotificationEnabledInput,
} from './notifications';

type Methods = Pick<
  AppBridgeState,
  'getNotificationSettings' | 'setNotificationEnabled' | 'requestNotificationPermission'
>;
type NotificationBridge = Methods & { isNativeMethodAvailable: (method: keyof Methods) => boolean };

/** 브라우저에서는 연결하지 않으며, 구버전 앱은 RPC 대기 없이 UNSUPPORTED를 반환합니다. */
export const createWebNotificationActions = (getBridge: () => NotificationBridge) => {
  const call = async <T>(
    method: keyof Methods,
    request: (bridge: Methods) => Promise<unknown>,
    schema: z.ZodType<T>,
  ): Promise<T | NotificationFailure> => {
    if (typeof window === 'undefined' || !('ReactNativeWebView' in window)) {
      return notificationFailure('UNSUPPORTED');
    }
    try {
      const bridge = getBridge();
      if (!bridge.isNativeMethodAvailable(method)) {
        return notificationFailure('UNSUPPORTED');
      }
      const parsed = schema.safeParse(await request(bridge));
      return parsed.success ? parsed.data : notificationFailure('INVALID_RESPONSE');
    } catch {
      return notificationFailure('NETWORK');
    }
  };
  return {
    getNotificationSettings: () =>
      call(
        'getNotificationSettings',
        (bridge) => bridge.getNotificationSettings(),
        notificationSettingsResultSchema,
      ),
    setNotificationEnabled: (input: SetNotificationEnabledInput) => {
      const parsed = setNotificationEnabledInputSchema.safeParse(input);
      return parsed.success
        ? call(
            'setNotificationEnabled',
            (bridge) => bridge.setNotificationEnabled(parsed.data),
            notificationSettingsResultSchema,
          )
        : Promise.resolve(notificationFailure('INVALID_INPUT'));
    },
    requestNotificationPermission: () =>
      call(
        'requestNotificationPermission',
        (bridge) => bridge.requestNotificationPermission(),
        notificationPermissionResultSchema,
      ),
  };
};
