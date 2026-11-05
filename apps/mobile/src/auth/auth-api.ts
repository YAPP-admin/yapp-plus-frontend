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

export type NativeAuthenticationApiResult = Readonly<{
  data?: AuthenticationResponse;
  error?: unknown;
}>;

export type NativeVoidApiResult = Readonly<{ error?: unknown }>;

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
  renew: async (input: Options<RenewData, false>): Promise<NativeAuthenticationApiResult> => {
    const result = await renew(input);

    return result;
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
