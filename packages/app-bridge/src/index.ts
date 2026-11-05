import type { BridgeStore } from '@webview-bridge/web';
import { z } from 'zod';

/** WebView와 native가 공유하는 브리지 타입·검증·상수 계약입니다. */

export const YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN = 'YAPPPlusWebView';

export const isYappPlusWebViewUserAgent = (userAgent: string | null | undefined): boolean =>
  typeof userAgent === 'string' &&
  userAgent.split(/\s+/).includes(YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN);

export type SafeAreaInsets = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

/** WebView가 native OIDC를 요청할 때 허용하는 공급자입니다. */
export type AuthProvider = 'apple' | 'google';

/** WebView가 분기할 수 있는 native 인증 결과 상태입니다. */
export const AUTH_STATUS = {
  signedIn: 'SIGNED_IN',
  signupRequired: 'SIGNUP_REQUIRED',
  signedOut: 'SIGNED_OUT',
  authenticating: 'AUTHENTICATING',
  cancelled: 'CANCELLED',
  error: 'ERROR',
  unavailable: 'UNAVAILABLE',
  withdrawn: 'WITHDRAWN',
} as const;

/** 원본 서버 오류를 노출하지 않고 WebView에 전달하는 인증 오류 코드입니다. */
export const AUTH_ERROR_CODE = {
  invalidInput: 'INVALID_INPUT',
  authRequired: 'AUTH_REQUIRED',
  signupExpired: 'SIGNUP_EXPIRED',
  conflict: 'CONFLICT',
  busy: 'BUSY',
  network: 'NETWORK',
  timeout: 'TIMEOUT',
  storage: 'STORAGE',
  server: 'SERVER',
  invalidResponse: 'INVALID_RESPONSE',
  outcomeUnknown: 'OUTCOME_UNKNOWN',
  unsupported: 'UNSUPPORTED',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];

/** 오류 코드별 기본 한국어 안내입니다. WebView는 필요하면 이 값을 그대로 표시할 수 있습니다. */
export const AUTH_ERROR_MESSAGE: Readonly<Record<AuthErrorCode, string>> = {
  [AUTH_ERROR_CODE.invalidInput]: '입력한 정보를 다시 확인해 주세요.',
  [AUTH_ERROR_CODE.authRequired]: '로그인이 필요해요.',
  [AUTH_ERROR_CODE.signupExpired]: '가입 정보가 만료되었어요. 다시 로그인해 주세요.',
  [AUTH_ERROR_CODE.conflict]: '이미 처리된 요청이에요.',
  [AUTH_ERROR_CODE.busy]: '로그인을 진행하고 있어요. 잠시만 기다려 주세요.',
  [AUTH_ERROR_CODE.network]: '네트워크 연결을 확인해 주세요.',
  [AUTH_ERROR_CODE.timeout]: '요청 시간이 초과되었어요. 다시 시도해 주세요.',
  [AUTH_ERROR_CODE.storage]: '로그인 정보를 저장하지 못했어요. 다시 시도해 주세요.',
  [AUTH_ERROR_CODE.server]: '로그인 처리 중 문제가 발생했어요. 다시 시도해 주세요.',
  [AUTH_ERROR_CODE.invalidResponse]: '로그인 응답을 처리하지 못했어요. 다시 시도해 주세요.',
  [AUTH_ERROR_CODE.outcomeUnknown]: '요청 결과를 확인하지 못했어요. 다시 로그인해 주세요.',
  [AUTH_ERROR_CODE.unsupported]: '현재 지원하지 않는 기능이에요.',
};

export type AuthFieldError = Readonly<{
  field: 'name' | 'phoneNumber';
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'TOO_LONG' | 'ALREADY_EXISTS';
}>;

export type AuthSession = Readonly<{
  accessToken: string;
  expiresAt: number;
  userId: number;
  sessionId: string;
  tokenVersion: number;
}>;

/**
 * WebView로 전달해도 되는 인증 결과입니다.
 * refresh token과 registration token, 서버의 원문 오류는 native 경계를 넘지 않습니다.
 */
export type AuthResult =
  | Readonly<{ status: typeof AUTH_STATUS.signedIn; session: AuthSession }>
  | Readonly<{ status: typeof AUTH_STATUS.signupRequired; expiresAt: number }>
  | Readonly<{ status: typeof AUTH_STATUS.signedOut }>
  | Readonly<{ status: typeof AUTH_STATUS.authenticating }>
  | Readonly<{ status: typeof AUTH_STATUS.cancelled }>
  | Readonly<{
      status: typeof AUTH_STATUS.error | typeof AUTH_STATUS.unavailable;
      code: AuthErrorCode;
      retryable: boolean;
      fieldErrors?: readonly AuthFieldError[];
    }>
  | Readonly<{ status: typeof AUTH_STATUS.withdrawn }>;

export const signInInputSchema = z.object({
  provider: z.enum(['apple', 'google']),
});
export const completeSignupInputSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
});
export const refreshSessionInputSchema = z.object({
  sessionId: z.string().min(1),
  tokenVersion: z.number().int().positive(),
});

export type SignInInput = z.infer<typeof signInInputSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupInputSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionInputSchema>;

/** safe-area 공유 상태와 native 인증 RPC의 공개 계약입니다. */
export type AppBridgeState = {
  safeAreaInsets: SafeAreaInsets;
  getSafeAreaInsets: () => Promise<SafeAreaInsets>;
  signIn: (input: SignInInput) => Promise<AuthResult>;
  completeSignup: (input: CompleteSignupInput) => Promise<AuthResult>;
  getSession: () => Promise<AuthResult>;
  refreshSession: (input: RefreshSessionInput) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  withdraw: () => Promise<AuthResult>;
};

export type AppBridgeStore = BridgeStore<AppBridgeState>;

export const INITIAL_SAFE_AREA_INSETS: SafeAreaInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const SAFE_AREA_CSS_VARIABLES = Object.freeze({
  top: '--safe-area-inset-top',
  right: '--safe-area-inset-right',
  bottom: '--safe-area-inset-bottom',
  left: '--safe-area-inset-left',
} as const);

export const SEED_SAFE_AREA_CSS_VARIABLES = Object.freeze({
  top: '--seed-safe-area-top',
  right: '--seed-safe-area-right',
  bottom: '--seed-safe-area-bottom',
  left: '--seed-safe-area-left',
} as const);

const normalizeInset = (value: number | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
};

export const normalizeSafeAreaInsets = (
  insets?: Partial<SafeAreaInsets> | null,
): SafeAreaInsets => ({
  top: normalizeInset(insets?.top),
  right: normalizeInset(insets?.right),
  bottom: normalizeInset(insets?.bottom),
  left: normalizeInset(insets?.left),
});
