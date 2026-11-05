import type { BridgeStore } from '@webview-bridge/web';
import { z } from 'zod';

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

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'AUTH_REQUIRED'
  | 'SIGNUP_EXPIRED'
  | 'CONFLICT'
  | 'BUSY'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'STORAGE'
  | 'SERVER'
  | 'INVALID_RESPONSE'
  | 'OUTCOME_UNKNOWN'
  | 'UNSUPPORTED';

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
  | Readonly<{ status: 'SIGNED_IN'; session: AuthSession }>
  | Readonly<{ status: 'SIGNUP_REQUIRED'; expiresAt: number }>
  | Readonly<{ status: 'SIGNED_OUT' }>
  | Readonly<{ status: 'AUTHENTICATING' }>
  | Readonly<{ status: 'CANCELLED' }>
  | Readonly<{
      status: 'ERROR' | 'UNAVAILABLE';
      code: AuthErrorCode;
      retryable: boolean;
      fieldErrors?: readonly AuthFieldError[];
    }>
  | Readonly<{ status: 'WITHDRAWN' }>;

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
  authRevision: number;
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
