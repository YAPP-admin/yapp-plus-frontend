/** Signup Activity의 step 이력을 좁은 가입 흐름 API로 제공합니다. */

import { useActivity, useStepFlow } from '@stackflow/react';
import type { SignupStep } from '@/pages/signup';

/** 현재 Signup Activity에서만 단계 추가와 복귀를 수행합니다. 폼 값은 화면 수명 동안 SignupPage가 소유합니다. */
export function useSignupFunnel() {
  const activity = useActivity();
  const stepFlow = useStepFlow('Signup');
  const latestStep = activity.steps.filter((item) => item.id !== activity.id).at(-1);
  const step = readSignupStep(latestStep?.params);

  return {
    step,
    next: () => {
      stepFlow.pushStep({ step: 'phone' }, { targetActivityId: activity.id });
    },
    back: () => {
      if (step === 'phone') {
        stepFlow.popStep({ targetActivityId: activity.id });
      }
    },
  };
}

function readSignupStep(params: unknown): SignupStep {
  return params && typeof params === 'object' && 'step' in params && params.step === 'phone'
    ? 'phone'
    : 'name';
}
