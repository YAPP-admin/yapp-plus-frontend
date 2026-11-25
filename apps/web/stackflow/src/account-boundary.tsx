import { activityGuardPlugin, redirect } from '@stackflow/plugin-activity-guard';
import { useFlow, type StackflowReactPlugin } from '@stackflow/react';
import type { QueryClient } from '@tanstack/react-query';
import { Fragment, useEffect, type ReactNode } from 'react';
import {
  AuthErrorBoundary,
  isAuthenticationRequiredResult,
  isNativeWebView,
  nativeSessionQueryOptions,
  NativeSessionRecovery,
  useNativeAuthSession,
} from '@/features/auth';

const publicActivities = new Set([
  'Login',
  'LoginError',
  'Error',
  'Signup',
  'SignupStatus',
  'SignupUnregistered',
  'NotFound',
]);

const developmentPublicActivities = new Set(['DevRoutes', 'DiningList', 'DiningDetail']);

/** 개발 전용 경로는 WebView 인증 상태와 무관하게 fixture 화면을 확인할 수 있다. */
const isPublicActivity = (name: string): boolean =>
  publicActivities.has(name) || (import.meta.env.DEV && developmentPublicActivities.has(name));

/** 확정된 로그아웃의 새 진입은 화면을 만들기 전에 공식 가드가 로그인으로 바꿉니다. */
export function nativeEntryGuard(client: QueryClient, activities: readonly { name: string }[]) {
  return activityGuardPlugin({
    guards: Object.fromEntries(
      activities
        .filter(({ name }) => !isPublicActivity(name))
        .map(({ name }) => [
          name,
          () => {
            const result = client.getQueryData(nativeSessionQueryOptions(true).queryKey);
            const signedOut =
              result?.status === 'SIGNED_OUT' ||
              result?.status === 'WITHDRAWN' ||
              result?.status === 'SIGNUP_REQUIRED' ||
              isAuthenticationRequiredResult(result);
            return isNativeWebView() && signedOut ? redirect('Login', {}) : true;
          },
        ]),
    ),
  });
}

/** 공식 가드가 실행되지 않는 pop 복원과 조회 불가 상태에서도 보호 내용을 숨깁니다. */
export function accountBoundaryPlugin(): StackflowReactPlugin {
  return () => ({
    key: 'account-boundary',
    wrapActivity: ({ activity }) => (
      <AccountScreen activity={activity}>{activity.render()}</AccountScreen>
    ),
  });
}

function AccountScreen({
  activity,
  children,
}: {
  activity: { name: string; isTop: boolean };
  children: ReactNode;
}) {
  const { isNative, phase, session } = useNativeAuthSession();
  const protectedScreen = !isPublicActivity(activity.name);
  const blocked = isNative && protectedScreen && phase !== 'SIGNED_IN';
  const flow = useFlow();

  useEffect(() => {
    if (blocked && activity.isTop && (phase === 'SIGNED_OUT' || phase === 'AUTH_REQUIRED')) {
      flow.replace('Login', {});
    }
  }, [blocked, activity.isTop, phase, flow]);

  if (isNative && phase === 'UNAVAILABLE' && protectedScreen) {
    return activity.isTop ? (
      <NativeSessionRecovery onGoToLogin={() => flow.replace('Login', {})} />
    ) : null;
  }
  if (blocked) {
    return null;
  }
  // Stack은 유지하고 계정이 바뀐 보호 화면의 로컬 상태만 초기화합니다.
  return protectedScreen ? (
    <Fragment key={JSON.stringify([session?.userId, session?.sessionId])}>
      <AuthErrorBoundary>{children}</AuthErrorBoundary>
    </Fragment>
  ) : (
    children
  );
}
