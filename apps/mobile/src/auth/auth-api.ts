/** 생성 OpenAPI 함수의 제네릭 결과를 native 인증 흐름의 단순 계약으로 변환합니다. */

import {
  authenticateApple,
  authenticateGoogle,
  register1,
  renew,
  revoke,
  withdraw,
  type Options,
  type AuthenticateAppleData,
  type AuthenticateGoogleData,
  type Register1Data,
  type RenewData,
  type RevokeData,
  type WithdrawData,
  type AuthenticationResponse,
} from '@yapp-plus/api/generated';

import { toCredentials } from './credentials';
import type { RenewalResult } from './session';

export type NativeAuthenticationApiResult = Readonly<{
  data?: AuthenticationResponse;
  error?: unknown;
}>;

export type NativeVoidApiResult = Readonly<{ error?: unknown }>;

const transportFailure = (error: unknown): RenewalResult => ({
  kind: 'temporary-failure',
  reason: error instanceof Error && error.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK',
});

const interpretRenewalResponse = (
  result: NativeAuthenticationApiResult & { response?: Response },
): RenewalResult => {
  const status = result.response?.status;
  if (status === 401) {
    return { kind: 'invalid-session' };
  }
  if (status !== undefined && status >= 500) {
    return { kind: 'temporary-failure', reason: 'SERVER' };
  }
  if (status !== undefined && status >= 400) {
    return { kind: 'rejected' };
  }
  if (result.error !== undefined && status === undefined) {
    return transportFailure(result.error);
  }
  if (result.error !== undefined || status !== 200) {
    return { kind: 'invalid-response' };
  }
  const credentials = result.data ? toCredentials(result.data) : undefined;
  return credentials ? { kind: 'success', credentials } : { kind: 'invalid-response' };
};

export const nativeAuthApi = {
  authenticateApple: async (
    input: Options<AuthenticateAppleData, false>,
  ): Promise<NativeAuthenticationApiResult> => {
    const result = await authenticateApple(input);

    return result;
  },
  authenticateGoogle: async (
    input: Options<AuthenticateGoogleData, false>,
  ): Promise<NativeAuthenticationApiResult> => {
    const result = await authenticateGoogle(input);

    return result;
  },
  register: async (
    input: Options<Register1Data, false>,
  ): Promise<NativeAuthenticationApiResult> => {
    const result = await register1(input);

    return result;
  },
  renew: async (input: Options<RenewData, false>): Promise<RenewalResult> => {
    try {
      const result = await renew({
        ...input,
        throwOnError: false,
        responseStyle: 'fields',
        timeout: 20_000,
        retry: 0,
      });
      return interpretRenewalResponse(result);
    } catch (error) {
      return transportFailure(error);
    }
  },
  revoke: async (input: Options<RevokeData, false>): Promise<NativeVoidApiResult> => {
    const result = await revoke(input);

    return result;
  },
  withdraw: async (input: Options<WithdrawData, false>): Promise<NativeVoidApiResult> => {
    const result = await withdraw(input);

    return result;
  },
};
