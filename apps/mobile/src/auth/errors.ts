/** native 인증 흐름에서 SDK 원인을 보존하며 분기하는 오류 타입입니다. */

export type NativeAuthenticationErrorCode = 'CANCELLED' | 'CREDENTIAL_MISSING' | 'PROVIDER_FAILURE';

export class NativeAuthenticationError extends Error {
  public constructor(
    public readonly code: NativeAuthenticationErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'NativeAuthenticationError';
  }
}

export class NativeAuthenticationCancelledError extends NativeAuthenticationError {
  public constructor(cause?: unknown) {
    super('CANCELLED', '로그인을 취소했어요.', cause);
    this.name = 'NativeAuthenticationCancelledError';
  }
}
