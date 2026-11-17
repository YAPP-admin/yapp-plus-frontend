import { useActivity, useFlow, useStepFlow } from '@stackflow/react';
import { Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import {
  AttendanceCodeSheet,
  AttendanceReportSheet,
  TeamGuideSheet,
  type AttendanceReportStep,
} from '@/pages/home';
import { NotFoundActivity } from './activities';

export function AttendanceCodeActivity() {
  const { isActive } = useActivity();
  const flow = useFlow();
  return (
    <AttendanceCodeSheet
      open={isActive}
      onOpenChange={(open) => {
        if (!open && isActive) {
          flow.pop();
        }
      }}
      onComplete={() => flow.replace('AttendanceComplete', {})}
    />
  );
}

export function AttendanceReportActivity() {
  const { isActive } = useActivity();
  const flow = useFlow();
  const snackbar = useSnackbarAdapter();
  const funnel = useAttendanceReportFunnel();
  return (
    <AttendanceReportSheet
      open={isActive}
      step={funnel.step}
      onReasonStep={funnel.next}
      onTypeStep={funnel.back}
      onOpenChange={(open) => {
        if (!open && isActive) {
          flow.pop();
        }
      }}
      onComplete={() => {
        flow.pop();
        snackbar.create({
          render: () => (
            <Snackbar
              message="출결 보고를 완료했어요"
              actionLabel="확인"
              onAction={() => snackbar.dismiss()}
            />
          ),
        });
      }}
    />
  );
}

/** 보고 유형·사유 단계의 이력만 현재 Activity 안에 남겨 닫기와 재진입 시 초안을 폐기합니다. */
function useAttendanceReportFunnel() {
  const activity = useActivity();
  const stepFlow = useStepFlow('AttendanceReport');
  const latestStep = activity.steps.filter((item) => item.id !== activity.id).at(-1);
  const step = readAttendanceReportStep(latestStep?.params);

  return {
    step,
    next: () => stepFlow.pushStep({ step: 'reason' }, { targetActivityId: activity.id }),
    back: () => {
      if (step === 'reason') {
        stepFlow.popStep({ targetActivityId: activity.id });
      }
    },
  };
}

function readAttendanceReportStep(params: unknown): AttendanceReportStep {
  return params && typeof params === 'object' && 'step' in params && params.step === 'reason'
    ? 'reason'
    : 'type';
}

export function TeamAttendanceGuideActivity() {
  const { isActive } = useActivity();
  const flow = useFlow();
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKING !== 'true') {
    return <NotFoundActivity />;
  }
  return (
    <TeamGuideSheet
      open={isActive}
      onOpenChange={(open) => {
        if (!open && isActive) {
          flow.pop();
        }
      }}
      onComplete={() => flow.replace('TeamAttendanceUpload', {})}
    />
  );
}
