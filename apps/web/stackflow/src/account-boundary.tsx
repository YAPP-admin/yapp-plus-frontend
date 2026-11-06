import type { StackflowReactPlugin } from '@stackflow/react';
import { useFlow } from '@stackflow/react/future';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { NativeSessionRecovery, useNativeAuthSession } from '@/features/auth';

const RetiredActivities = createContext<ReadonlySet<string>>(new Set());
const publicActivities = new Set([
  'Login',
  'LoginError',
  'Error',
  'Signup',
  'SignupStatus',
  'SignupUnregistered',
  'NotFound',
]);

/** 탐색과 이력은 Stackflow에 맡기고 계정이 바뀐 화면의 렌더링만 차단합니다. */
export function accountBoundaryPlugin(): StackflowReactPlugin {
  return () => ({
    key: 'account-boundary',
    wrapStack: ({ stack }) => (
      <AccountActivityBoundary activities={stack.activities}>
        {stack.render()}
      </AccountActivityBoundary>
    ),
    wrapActivity: ({ activity }) => (
      <AccountScreen activity={activity}>{activity.render()}</AccountScreen>
    ),
  });
}

/** 이미 pop된 Activity도 기록해 browser forward로 복원될 때 이전 내용을 보여주지 않습니다. */
function AccountActivityBoundary({
  activities,
  children,
}: {
  activities: readonly { id: string }[];
  children: ReactNode;
}) {
  const { accountRevision } = useNativeAuthSession();
  const [boundary, setBoundary] = useState(() => ({
    revision: accountRevision,
    retired: new Set<string>(),
  }));
  if (boundary.revision !== accountRevision) {
    // 자식을 렌더하기 전에 변경을 반영하므로 이전 계정 화면이 한 프레임 노출되지 않습니다.
    setBoundary({
      revision: accountRevision,
      retired: new Set([...boundary.retired, ...activities.map(({ id }) => id)]),
    });
    return null;
  }
  return <RetiredActivities value={boundary.retired}>{children}</RetiredActivities>;
}

/** 현재 Activity가 이전 계정에 속해 폐기됐는지 확인합니다. */
function useIsRetiredActivity(activityId: string): boolean {
  return useContext(RetiredActivities).has(activityId);
}

/** 숨겨진 화면은 내용을 해제하고, 실제 최상위 화면만 목적지로 교체합니다. */
function AccountScreen({
  activity,
  children,
}: {
  activity: { id: string; name: string; isTop: boolean };
  children: ReactNode;
}) {
  const { isNative, phase, accountDestination } = useNativeAuthSession();
  const retired = useIsRetiredActivity(activity.id);
  const protectedScreen = !publicActivities.has(activity.name);
  const blocked = isNative && (retired || (protectedScreen && phase !== 'SIGNED_IN'));
  const flow = useFlow();

  useEffect(() => {
    if (!blocked || !activity.isTop || phase === 'LOADING' || phase === 'UNAVAILABLE') {
      return;
    }
    if (phase !== 'SIGNED_IN') {
      flow.replace('Login', {});
    } else if (accountDestination === 'signup-complete') {
      flow.replace('SignupComplete', {});
    } else {
      flow.replace('Tabs', { initialTab: 'home' });
    }
  }, [blocked, activity.isTop, phase, accountDestination, flow]);

  if (isNative && phase === 'UNAVAILABLE' && (protectedScreen || activity.name === 'Login')) {
    return activity.isTop ? <NativeSessionRecovery /> : null;
  }
  return blocked ? null : children;
}
