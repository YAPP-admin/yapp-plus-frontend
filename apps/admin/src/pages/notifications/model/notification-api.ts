import { ApiError } from '@yapp-plus/api';
import { zErrorResponse } from '@yapp-plus/api/generated';

export type NotificationApiFailure = {
  status?: number;
  code?: string;
};

export function toNotificationApiFailure(error: unknown): NotificationApiFailure {
  if (!(error instanceof ApiError)) {
    return {};
  }

  const body = zErrorResponse.safeParse(error.body);
  return {
    status: error.status,
    code: body.success ? body.data.code : undefined,
  };
}
