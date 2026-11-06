/** Apple·Google SDK에서 OIDC credential을 얻고 공급자 오류를 표준화하는 모듈입니다. */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';
import type { AuthProvider } from '@yapp-plus/app-bridge';
import { NativeAuthenticationCancelledError, NativeAuthenticationError } from './errors';

// OAuth client ID는 공개 식별자이며, 검증은 백엔드가 ID token의 audience로 수행합니다.
const GOOGLE_IOS_CLIENT_ID =
  '47093355379-s1gkq650qpgjhvsb2bev9h4na5mlmnsi.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID =
  '47093355379-bl1tgba0nj3sn5610bn01aeqc7mm4ljb.apps.googleusercontent.com';

const NATIVE_AUTHENTICATION_MESSAGE = {
  appleCredentialMissing: 'Apple 로그인 정보를 받지 못했어요. 다시 시도해 주세요.',
  appleFailed: 'Apple 로그인 중 문제가 발생했어요. 다시 시도해 주세요.',
  googleCredentialMissing: 'Google 로그인 정보를 받지 못했어요. 다시 시도해 주세요.',
  googleFailed: 'Google 로그인 중 문제가 발생했어요. 다시 시도해 주세요.',
} as const;

export type NativeIdentity =
  | Readonly<{
      provider: Extract<AuthProvider, 'apple'>;
      identityToken: string;
      authorizationCode: string;
      nonce: string;
    }>
  | Readonly<{ provider: Extract<AuthProvider, 'google'>; idToken: string; nonce: string }>;

const hasErrorCode = (error: unknown, code: string): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as Readonly<{ code?: unknown }>).code === code;

/** OIDC nonce의 원본과 SDK에 전달할 SHA-256 소문자 hex 값을 함께 만듭니다. */
const createNonce = async (): Promise<Readonly<{ raw: string; hashed: string }>> => {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const raw = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
  return { raw, hashed };
};

const authenticateApple = async (): Promise<NativeIdentity> => {
  const nonce = await createNonce();

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: nonce.hashed,
    });
    if (!credential.identityToken || !credential.authorizationCode) {
      throw new NativeAuthenticationError(
        'CREDENTIAL_MISSING',
        NATIVE_AUTHENTICATION_MESSAGE.appleCredentialMissing,
      );
    }
    return {
      provider: 'apple',
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      nonce: nonce.raw,
    };
  } catch (error) {
    if (hasErrorCode(error, 'ERR_REQUEST_CANCELED')) {
      throw new NativeAuthenticationCancelledError(error);
    }
    if (error instanceof NativeAuthenticationError) {
      throw error;
    }
    throw new NativeAuthenticationError(
      'PROVIDER_FAILURE',
      NATIVE_AUTHENTICATION_MESSAGE.appleFailed,
      error,
    );
  }
};

const authenticateGoogle = async (): Promise<NativeIdentity> => {
  const nonce = await createNonce();
  // configure의 nonce는 다음 Google ID token의 nonce claim에 들어갈 SHA-256 hex 값입니다.
  try {
    GoogleOneTapSignIn.configure({
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      nonce: nonce.hashed,
    });
    const silentResponse = await GoogleOneTapSignIn.signIn();
    const accountResponse = isNoSavedCredentialFoundResponse(silentResponse)
      ? await GoogleOneTapSignIn.createAccount()
      : silentResponse;
    const response = isNoSavedCredentialFoundResponse(accountResponse)
      ? await GoogleOneTapSignIn.presentExplicitSignIn()
      : accountResponse;
    if (isCancelledResponse(response)) {
      throw new NativeAuthenticationCancelledError();
    }
    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new NativeAuthenticationError(
        'CREDENTIAL_MISSING',
        NATIVE_AUTHENTICATION_MESSAGE.googleCredentialMissing,
      );
    }
    return { provider: 'google', idToken: response.data.idToken, nonce: nonce.raw };
  } catch (error) {
    if (error instanceof NativeAuthenticationError) {
      throw error;
    }
    throw new NativeAuthenticationError(
      'PROVIDER_FAILURE',
      NATIVE_AUTHENTICATION_MESSAGE.googleFailed,
      error,
    );
  }
};

type ProviderStrategy = () => Promise<NativeIdentity>;

const providerStrategies: Readonly<Record<AuthProvider, ProviderStrategy>> = {
  apple: authenticateApple,
  google: authenticateGoogle,
};

/** 공급자 전략을 선택해 백엔드 검증에 필요한 OIDC 자격만 반환합니다. */
export const authenticateWithProvider = (provider: AuthProvider): Promise<NativeIdentity> =>
  providerStrategies[provider]();
