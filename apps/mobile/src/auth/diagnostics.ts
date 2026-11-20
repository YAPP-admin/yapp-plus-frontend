/** 개발 빌드에서만 민감 정보 없이 native 인증 흐름의 단계 결과를 기록합니다. */

type NativeAuthStage = 'provider' | 'exchange' | 'storage';
type NativeAuthOutcome = 'started' | 'succeeded' | 'cancelled' | 'failed';

/** 토큰·nonce·사용자 정보·응답 본문을 받지 않아 로그 유출을 구조적으로 막습니다. */
export const traceNativeAuth = (
  stage: NativeAuthStage,
  outcome: NativeAuthOutcome,
  httpStatus?: number,
): void => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }
  const status = httpStatus === undefined ? '' : ` http=${httpStatus}`;
  // oxlint-disable-next-line no-console -- 개발 빌드의 원인 분류용이며 민감 값은 인자로 받지 않습니다.
  console.info(`[auth] ${stage} ${outcome}${status}`);
};
