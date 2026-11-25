/** 앱이 주입하는 오류 위임 규칙을 제공한다. shared UI는 인증 도메인을 직접 알지 않는다. */
import { createContext, useContext, type ReactNode } from 'react';

export type ErrorBoundaryPolicy = { shouldRethrow: (error: unknown) => boolean };

const DEFAULT_ERROR_BOUNDARY_POLICY: ErrorBoundaryPolicy = { shouldRethrow: () => false };
const ErrorBoundaryPolicyContext = createContext<ErrorBoundaryPolicy>(
  DEFAULT_ERROR_BOUNDARY_POLICY,
);

/** 하위 오류 경계가 상위 경계로 넘겨야 할 오류의 분류를 앱에서 제공한다. */
export function ErrorBoundaryPolicyProvider({
  children,
  policy,
}: {
  children: ReactNode;
  policy: ErrorBoundaryPolicy;
}) {
  return <ErrorBoundaryPolicyContext value={policy}>{children}</ErrorBoundaryPolicyContext>;
}

export function useErrorBoundaryPolicy() {
  return useContext(ErrorBoundaryPolicyContext);
}
