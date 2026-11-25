/** native 인증 상태에 따라 Stackflow 활동을 한 번 전환하는 공통 경계입니다. */

import { useActivity, useFlow } from '@stackflow/react';
import { useEffect } from 'react';
import { useNativeAuthSession } from '@/features/auth';

type NativeAuthRedirectProps =
  | { target: 'LOGIN'; when: 'SIGNED_OUT'; unavailable?: boolean }
  | { target: 'TABS'; when: 'SIGNED_IN' }
  | { target: 'REVIEW'; when: 'REVIEW_REQUIRED' };

/** 화면마다 반복되던 native 인증 전환 effect를 한곳에서 관리합니다. */
export function NativeAuthRedirect(props: NativeAuthRedirectProps) {
  const flow = useFlow();
  const { isTop } = useActivity();
  const { isNative, phase, reviewStatus, reviewTransition } = useNativeAuthSession();
  const { target, when } = props;
  const unavailable = props.target === 'LOGIN' ? props.unavailable : false;
  const shouldRedirect =
    isTop &&
    isNative &&
    (when === 'SIGNED_OUT' ? phase !== 'LOADING' && phase !== 'SIGNED_IN' : phase === when);

  useEffect(() => {
    if (!shouldRedirect) {
      return;
    }

    // 인증 상태가 화면에 반영된 뒤 이동해야 대기 화면의 가드가 이전 상태로 되돌리지 않습니다.
    if (target === 'REVIEW') {
      flow.replace(reviewStatus === 'PENDING' ? 'SignupStatus' : 'Error', {});
      return;
    }

    if (target === 'TABS') {
      if (reviewTransition === 'PENDING_TO_APPROVED') {
        flow.replace('SignupComplete', {});
        return;
      }
      flow.replace('Tabs', { initialTab: 'home' });
      return;
    }

    flow.replace('Login', unavailable ? { error: 'true' } : {});
  }, [flow, target, unavailable, shouldRedirect, reviewStatus, reviewTransition]);

  return null;
}
