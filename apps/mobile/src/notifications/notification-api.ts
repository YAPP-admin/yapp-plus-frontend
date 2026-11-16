/** 생성 OpenAPI 기기 등록 요청과 HTTP 업무 응답을 변환하는 native 어댑터입니다. */

import {
  register,
  remove,
  type Options,
  type RegisterData,
  type RemoveData,
} from '@yapp-plus/api/generated';
import {
  requestWithSessionRefresh,
  type AuthRequestSession,
  type AuthRequestRuntime,
  type AuthRequestFailure,
} from '../auth/authenticated-request';

export type NotificationApiFailure = AuthRequestFailure | 'CONFLICT';
export type NotificationApiResult = { ok: true } | { ok: false; code: NotificationApiFailure };

/** 로그인 스냅샷과 서버의 설치 식별자·FCM 토큰을 함께 전달합니다. */
export type NotificationApiInput = AuthRequestSession &
  Readonly<{
    installationId: string;
    registrationToken?: string;
  }>;

const notificationDeviceHttpStatus = {
  noContent: 204,
  unauthorized: 401,
  conflict: 409,
} as const;

/** 네트워크 단절처럼 HTTP 응답을 받지 못한 생성 SDK 결과도 이 경계로 들어옵니다. */
type ApiResponse = Readonly<{ response?: Response }>;

const responseFailure = (response: Response | undefined): NotificationApiResult => {
  if (response?.status === notificationDeviceHttpStatus.unauthorized) {
    return { ok: false, code: 'AUTH_REQUIRED' };
  }
  if (response?.status === notificationDeviceHttpStatus.conflict) {
    return { ok: false, code: 'CONFLICT' };
  }
  return { ok: false, code: response === undefined ? 'NETWORK' : 'SERVER' };
};

const responseResult = ({ response }: ApiResponse): NotificationApiResult =>
  response?.status === notificationDeviceHttpStatus.noContent
    ? { ok: true }
    : responseFailure(response);

/**
 * 기기 등록 API를 생성 SDK에 한정합니다.
 * 204 외의 응답은 성공으로 취급하지 않으며 401은 현재 세션으로 한 번만 복구합니다.
 */
export const createNotificationApi = (runtime: AuthRequestRuntime) => {
  const registerDevice = async (input: NotificationApiInput): Promise<NotificationApiResult> => {
    const registrationToken = input.registrationToken;
    if (!registrationToken) {
      return Promise.resolve({ ok: false, code: 'SERVER' });
    }
    const result = await requestWithSessionRefresh(
      input,
      (accessToken) =>
        register({
          path: { installationId: input.installationId },
          body: { platform: 'IOS', registrationToken },
          headers: { Authorization: `Bearer ${accessToken}` },
          throwOnError: false,
          responseStyle: 'fields',
          retry: 0,
          timeout: 15_000,
        } satisfies Options<RegisterData, false>),
      runtime,
    );
    return result.ok ? responseResult(result) : result;
  };

  const removeDevice = async (input: NotificationApiInput): Promise<NotificationApiResult> => {
    const result = await requestWithSessionRefresh(
      input,
      (accessToken) =>
        remove({
          path: { installationId: input.installationId },
          headers: { Authorization: `Bearer ${accessToken}` },
          throwOnError: false,
          responseStyle: 'fields',
          retry: 0,
          timeout: 15_000,
        } satisfies Options<RemoveData, false>),
      runtime,
    );
    return result.ok ? responseResult(result) : result;
  };

  return { registerDevice, removeDevice };
};
