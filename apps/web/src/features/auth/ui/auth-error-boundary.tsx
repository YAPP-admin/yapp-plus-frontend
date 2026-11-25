/** 인증 오류만 처리하고 일반 오류는 최종 앱 경계로 전달합니다. */
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isAuthenticationError } from '../model/auth-error';
import { markAuthRequired } from '../model/operations';
import { useNativeAuthSession } from '../model/session';

export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const { isNative } = useNativeAuthSession();
  const shouldRethrow = (error: unknown) => isNative && isAuthenticationError(error);

  return (
    <ErrorBoundary
      onError={(error) => {
        if (shouldRethrow(error)) {
          markAuthRequired(client);
        }
      }}
      fallbackRender={({ error }) => {
        if (!shouldRethrow(error)) {
          throw error;
        }
        return null;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
