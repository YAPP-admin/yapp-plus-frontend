import { useActivity, useFlow } from '@stackflow/react';
import { Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { AttendanceCodeSheet, AttendanceReportSheet, TeamGuideSheet } from '@/pages/home';
import { NotFoundActivity } from './activities';

export function AttendanceCodeActivity() {
  const { isActive } = useActivity();
  const flow = useFlow();
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKING !== 'true') {
    return <NotFoundActivity />;
  }
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
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKING !== 'true') {
    return <NotFoundActivity />;
  }
  return (
    <AttendanceReportSheet
      open={isActive}
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
