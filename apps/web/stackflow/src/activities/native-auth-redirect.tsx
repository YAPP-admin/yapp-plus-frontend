/** native 인증 상태에 따라 Stackflow 활동을 한 번 전환하는 공통 경계입니다. */

import { useFlow } from '@stackflow/react';
import { useEffect } from 'react';
import { useNativeAuthSession } from '@/features/auth';

type NativeAuthRedirectProps =
  | { target: 'LOGIN'; when: 'SIGNED_OUT'; unavailable?: boolean }
  | { target: 'TABS'; when: 'SIGNED_IN' };

/** 화면마다 반복되던 native 인증 전환 effect를 한곳에서 관리합니다. */
export function NativeAuthRedirect(props: NativeAuthRedirectProps) {
  const flow = useFlow();
  const { isNative, phase } = useNativeAuthSession();
  const { target, when } = props;
  const unavailable = props.target === 'LOGIN' ? props.unavailable : false;
  const shouldRedirect =
    isNative &&
    (when === 'SIGNED_IN' ? phase === 'SIGNED_IN' : phase !== 'LOADING' && phase !== 'SIGNED_IN');

  useEffect(() => {
    if (!shouldRedirect) {
      return;
    }

    if (target === 'TABS') {
      flow.replace('Tabs', { initialTab: 'home' });
      return;
    }

    flow.replace('Login', unavailable ? { error: 'true' } : {});
  }, [flow, target, unavailable, shouldRedirect]);

  return null;
}
