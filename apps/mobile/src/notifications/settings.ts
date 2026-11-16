/** 알림 RPC를 기존 등록 큐·설치별 저장소에 연결합니다. Firebase SDK는 운영 연결부가 공급합니다. */
import {
  notificationFailure,
  setNotificationEnabledInputSchema,
  type NotificationFailure,
  type NotificationPermission,
  type NotificationSettingsResult,
  type NotificationPermissionResult,
} from '@yapp-plus/app-bridge';
import type { NotificationRegistration, NotificationRegistrationInput } from './registration';
import type { notificationStorage } from './storage';

/** 한 RPC가 시작한 로그인 수명과 OS의 상세 권한을 함께 보존합니다. */
export type NotificationSettingsContext = {
  input: NotificationRegistrationInput;
  readPermission: () => Promise<NotificationPermission>;
};

/** 조회는 권한 팝업 없이 실행하며 변경은 자동 동기화와 같은 조율기를 사용합니다. */
export const createNotificationSettingsActions = (
  getContext: () => Promise<NotificationSettingsContext | NotificationFailure>,
  registration: NotificationRegistration,
  storage: Pick<typeof notificationStorage, 'getSelection'>,
) => {
  const run = async <T>(
    operation: (context: NotificationSettingsContext) => Promise<T>,
  ): Promise<T | NotificationFailure> => {
    try {
      const context = await getContext();
      if ('status' in context) {
        return context;
      }
      if (!context.input.isSessionCurrent()) {
        return notificationFailure('BUSY');
      }
      const result = await operation(context);
      return context.input.isSessionCurrent() ? result : notificationFailure('BUSY');
    } catch {
      return notificationFailure('SERVER');
    }
  };
  const readSettings = async ({
    input,
    readPermission,
  }: NotificationSettingsContext): Promise<NotificationSettingsResult> => {
    const permission = await readPermission();
    try {
      const selection = await storage.getSelection(input.firebaseProjectId, input.installationId);
      return { status: 'SUCCESS', enabled: selection.enabled, permission };
    } catch {
      return notificationFailure('STORAGE');
    }
  };
  return {
    getNotificationSettings: (): Promise<NotificationSettingsResult> => run(readSettings),
    setNotificationEnabled: (value: unknown): Promise<NotificationSettingsResult> => {
      const parsed = setNotificationEnabledInputSchema.safeParse(value);
      if (!parsed.success) {
        return Promise.resolve(notificationFailure('INVALID_INPUT'));
      }
      return run(async (context) => {
        const changed = await registration.setEnabled(context.input, parsed.data.enabled);
        return changed.ok
          ? readSettings(context)
          : notificationFailure(changed.code === 'CANCELLED' ? 'BUSY' : changed.code);
      });
    },
    requestNotificationPermission: (): Promise<NotificationPermissionResult> =>
      run(async (context): Promise<NotificationPermissionResult> => {
        await registration.requestPermission(context.input);
        return { status: 'SUCCESS', permission: await context.readPermission() };
      }),
  };
};
