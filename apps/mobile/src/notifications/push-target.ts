/** 푸시 입력을 한 번 파싱한 뒤 제한된 탐색 대상과 발송 식별자로 변환합니다. */

import {
  notificationDestinationTypeSchema,
  type NotificationDestination,
} from '@yapp-plus/app-bridge';
import { z } from 'zod';

/** SDK 메시지에서 탐색에 필요한 필드만 받으며 data 값은 경계에서 검증합니다. */
export type PushTargetInput = { data?: unknown; messageId?: string };

// 백엔드는 공지에만 source=POST를 보내며 일반 알림은 source를 생략합니다.
const postPushSourceSchema = z.literal('POST');

const deliveryIdSchema = z.string().regex(/\S/).optional().catch(undefined);
const postIdSchema = z
  .string()
  .regex(/^[0-9]+$/)
  .transform(Number)
  .pipe(z.number().int().positive().safe())
  .optional()
  .catch(undefined);

// 잘못된 필드만 비워 공지 대상 오류가 유효한 발송 식별자까지 버리지 않도록 합니다.
const pushMessageSchema = z.object({
  data: z
    .object({
      source: postPushSourceSchema.optional().catch(undefined),
      postId: postIdSchema,
      postPushDeliveryId: deliveryIdSchema,
      notificationId: deliveryIdSchema,
    })
    .catch({}),
  messageId: deliveryIdSchema,
});

/** 잘못된 공지·일반 알림은 알림함으로 보냅니다. notificationId는 공지 ID로 사용하지 않습니다. */
export function parsePushTarget(input: PushTargetInput): {
  destination: NotificationDestination;
  deliveryKey: string | undefined;
} {
  const { data, messageId } = pushMessageSchema.parse(input);
  const isPost = data.source === postPushSourceSchema.value;

  const destination: NotificationDestination =
    isPost && data.postId !== undefined
      ? { type: notificationDestinationTypeSchema.enum.POST, postId: data.postId }
      : { type: notificationDestinationTypeSchema.enum.ALERTS };

  // POST/GENERAL은 중복 판별용 내부 구분이며 서버 source enum이 아닙니다.
  const deliveryId = isPost ? data.postPushDeliveryId : data.notificationId;
  if (deliveryId) {
    return { destination, deliveryKey: JSON.stringify([isPost ? 'POST' : 'GENERAL', deliveryId]) };
  }

  return { destination, deliveryKey: messageId ? JSON.stringify(['FCM', messageId]) : undefined };
}
