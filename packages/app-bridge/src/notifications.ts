/** 알림 설정 브리지는 설치별 선택과 OS 권한만 공개하며 FID·FCM 토큰은 전달하지 않습니다. */
import { z } from 'zod';

/** OS의 권한 상태를 저장된 수신 선택과 별도로 전달합니다. */
export const notificationPermissionSchema = z.enum([
  'notDetermined',
  'denied',
  'authorized',
  'provisional',
  'ephemeral',
]);
/** 알림 설정 실패를 화면이 처리할 수 있는 코드와 재시도 여부로 제한합니다. */
export const notificationFailureSchema = z.object({
  status: z.literal('ERROR'),
  code: z.enum([
    'UNSUPPORTED',
    'AUTH_REQUIRED',
    'PERMISSION_REQUIRED',
    'BUSY',
    'NETWORK',
    'SERVER',
    'STORAGE',
    'CONFLICT',
    'INVALID_INPUT',
    'INVALID_RESPONSE',
  ]),
  retryable: z.boolean(),
});
/** 문자열·숫자 truthy 값은 수신 선택으로 인정하지 않습니다. */
export const setNotificationEnabledInputSchema = z.object({ enabled: z.boolean() });
/** 조회·변경 성공은 저장된 선택과 조회한 OS 권한을 함께 반환합니다. */
export const notificationSettingsResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('SUCCESS'),
    enabled: z.boolean(),
    permission: notificationPermissionSchema,
  }),
  notificationFailureSchema,
]);
/** 권한 요청 결과에는 수신 선택을 포함하지 않습니다. 이 작업은 선택을 저장하지 않습니다. */
export const notificationPermissionResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('SUCCESS'), permission: notificationPermissionSchema }),
  notificationFailureSchema,
]);
export type NotificationPermission = z.infer<typeof notificationPermissionSchema>;
export type NotificationFailure = z.infer<typeof notificationFailureSchema>;
export type SetNotificationEnabledInput = z.infer<typeof setNotificationEnabledInputSchema>;
export type NotificationSettingsResult = z.infer<typeof notificationSettingsResultSchema>;
export type NotificationPermissionResult = z.infer<typeof notificationPermissionResultSchema>;

/** 네이티브 원문 오류 없이 공개 실패 결과를 생성합니다. 재시도는 사용자 동작으로 수행합니다. */
export const notificationFailure = (code: NotificationFailure['code']): NotificationFailure => ({
  status: 'ERROR',
  code,
  retryable: ['BUSY', 'NETWORK', 'SERVER', 'STORAGE', 'CONFLICT'].includes(code),
});

/** 웹 탐색 대상의 종류입니다. 서버의 알림 목록 type이나 푸시 source와 별도 계약입니다. */
export const notificationDestinationTypeSchema = z.enum(['ALERTS', 'POST']);

/** 푸시 탐색은 알림함 또는 양의 안전한 공지 ID만 허용하며 URL은 전달하지 않습니다. */
export const notificationDestinationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(notificationDestinationTypeSchema.enum.ALERTS) }),
  z.object({
    type: z.literal(notificationDestinationTypeSchema.enum.POST),
    postId: z.number().int().positive().safe(),
  }),
]);

/** 네이티브가 보관한 최신 탭 한 건입니다. eventId는 대상 ID와 구분되는 처리 확인용 값입니다. */
export const notificationOpenSchema = z.object({
  eventId: z.string().min(1),
  /** 알림을 눌렀을 때 웹이 이동할 알림함 또는 공지 상세 대상입니다. */
  destination: notificationDestinationSchema,
});

/** 이전 탭의 처리 확인이 새 대기를 지우지 않도록 eventId로 확인합니다. */
export const acknowledgeNotificationOpenInputSchema = z.object({
  eventId: z.string().min(1),
});

/** 새 푸시 수신 시 증가하는 목록 갱신 번호입니다. 알림 내용이나 읽지 않은 개수가 아닙니다. */
export const notificationRevisionSchema = z.number().int().nonnegative().safe();

export type NotificationDestination = z.infer<typeof notificationDestinationSchema>;
export type NotificationOpen = z.infer<typeof notificationOpenSchema>;

/** 웹이 처리를 마친 탭의 식별자를 전달합니다. */
export type AcknowledgeNotificationOpenInput = z.infer<
  typeof acknowledgeNotificationOpenInputSchema
>;
