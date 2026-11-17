/** 사전 출결 보고의 유형 선택·사유 입력·서버 제출을 바텀시트로 연결합니다. */
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { VStack } from '@seed-design/react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import {
  ActionButton,
  BottomSheetContent,
  BottomSheetRoot,
  RadioGroup,
  RadioGroupItem,
  TextField,
  TextFieldInput,
  type BottomSheetRootProps,
} from '@yapp-plus/ui';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import { staticContentEnabled } from '@/features/static-content';
import { formatKoreanTime } from '@/shared/lib/korean-date-time';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import {
  attendanceReportInputSchema,
  type AttendanceReportInput,
  useAttendanceReport,
} from '../model/attendance-report';
import {
  sheetContainer,
  sheetContent,
  sheetDescription,
  sheetHandleArea,
  sheetHandleBar,
  sheetPrimaryButton,
  sheetSecondaryButton,
  sheetTitle,
} from './home-page.css';

const reportTypes = [
  { value: 'LATE', label: '지각' },
  { value: 'EARLY_LEAVE', label: '조퇴' },
  { value: 'ABSENT', label: '결석' },
] as const;

export type AttendanceReportStep = 'type' | 'reason';

type AttendanceReportFormValues = {
  type: AttendanceReportInput['type'] | '';
  reason: string;
};

const initialAttendanceReportFormValues: AttendanceReportFormValues = { type: '', reason: '' };

type AttendanceReportSheetProps = BottomSheetRootProps & {
  onComplete: () => void;
};

function isAttendanceReportType(value: string): value is AttendanceReportInput['type'] {
  return reportTypes.some((type) => type.value === value);
}

function validateReportType(value: AttendanceReportFormValues['type']) {
  return isAttendanceReportType(value) ? undefined : '출결 유형을 선택해 주세요.';
}

function validateReportReason(value: string) {
  const parsed = attendanceReportInputSchema.safeParse({ type: 'LATE', reason: value });
  return parsed.success ? undefined : (parsed.error.issues[0]?.message ?? '사유를 확인해 주세요.');
}

/** 인증·정적 콘텐츠 제한과 현재 주간 조회 상태를 보고 시트 안에서 표시합니다. */
export function AttendanceReportSheet({ onComplete, ...props }: AttendanceReportSheetProps) {
  const { isNative } = useNativeAuthSession();
  const [step, setStep] = useState<AttendanceReportStep>('type');

  if (staticContentEnabled()) {
    return (
      <ReportSheetShell {...props} step={step}>
        <ReportSheetMessage message="정적 콘텐츠에서는 사전 출결 보고를 할 수 없어요." />
      </ReportSheetShell>
    );
  }
  if (!isNative) {
    return (
      <ReportSheetShell {...props} step={step}>
        <ReportSheetMessage message="YAPP+ 앱에 로그인한 후 사전 출결 보고를 할 수 있어요." />
      </ReportSheetShell>
    );
  }

  return (
    <QueryBoundary
      errorFallback={
        <ReportSheetShell {...props} step={step}>
          <ReportSheetError />
        </ReportSheetShell>
      }
      pendingFallback={
        <ReportSheetShell {...props} step={step}>
          <ReportSheetMessage message="보고할 세션을 불러오고 있어요…" />
        </ReportSheetShell>
      }
    >
      <AttendanceReportContent
        {...props}
        step={step}
        onReasonStep={() => setStep('reason')}
        onTypeStep={() => setStep('type')}
        onComplete={onComplete}
      />
    </QueryBoundary>
  );
}

function ReportSheetShell({
  children,
  step,
  ...props
}: BottomSheetRootProps & { children: ReactNode; step: AttendanceReportStep }) {
  const layerIndex = useActivityZIndexBase();
  const title = step === 'type' ? '출결을 보고해 주세요' : '사유를 입력해 주세요';

  return (
    <BottomSheetRoot {...props}>
      <BottomSheetContent
        layerIndex={layerIndex}
        aria-label={title}
        showHandle={false}
        showCloseButton={false}
        className={sheetContent}
      >
        <div className={sheetHandleArea} aria-hidden="true">
          <div className={sheetHandleBar} />
        </div>
        {children}
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}

function ReportSheetMessage({ message }: { message: string }) {
  return (
    <VStack gap="x5" className={sheetContainer}>
      <output>{message}</output>
      <ActionButton variant="brandSolid" size="large" className={sheetPrimaryButton} disabled>
        확인
      </ActionButton>
    </VStack>
  );
}

function ReportSheetError() {
  const { resetBoundary } = useErrorBoundary();
  return (
    <VStack gap="x5" className={sheetContainer}>
      <p role="alert">보고할 세션을 불러오지 못했어요. 다시 확인해 주세요.</p>
      <ActionButton
        variant="brandSolid"
        size="large"
        className={sheetPrimaryButton}
        onClick={resetBoundary}
      >
        세션 다시 확인
      </ActionButton>
    </VStack>
  );
}

function AttendanceReportContent({
  step,
  onReasonStep,
  onTypeStep,
  onComplete,
  ...props
}: AttendanceReportSheetProps) {
  const report = useAttendanceReport(onComplete);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const reasonCharacterCountId = useId();
  const form = useForm({
    defaultValues: initialAttendanceReportFormValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      if (step === 'type') {
        onReasonStep();
        return;
      }
      if (!isAttendanceReportType(value.type)) {
        return;
      }
      setSubmissionMessage(report.submit({ type: value.type, reason: value.reason }) ?? '');
    },
  });

  if (!report.target) {
    return (
      <ReportSheetShell {...props} step={step}>
        <ReportSheetMessage message="이번 주에는 보고할 세션이 없어요." />
      </ReportSheetShell>
    );
  }
  if (!report.reportable) {
    return (
      <ReportSheetShell {...props} step={step}>
        <VStack gap="x5" className={sheetContainer}>
          <VStack gap="x1_5" width="full">
            <h2 className={sheetTitle}>사전 출결 보고가 마감됐어요</h2>
            <p className={sheetDescription}>
              {report.target.name}은(는) {formatKoreanTime(report.target.startTime)}에 시작했어요.
            </p>
          </VStack>
          <ActionButton variant="brandSolid" size="large" className={sheetPrimaryButton} disabled>
            확인
          </ActionButton>
        </VStack>
      </ReportSheetShell>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!report.pending) {
      setSubmissionMessage('');
      void form.handleSubmit();
    }
  }

  return (
    <ReportSheetShell {...props} step={step} dismissible={!report.pending}>
      <VStack as="form" gap="x5" className={sheetContainer} onSubmit={handleSubmit}>
        {step === 'type' ? (
          <VStack gap="x5" width="full">
            <VStack gap="x1_5" width="full">
              <h2 className={sheetTitle}>출결을 보고해 주세요</h2>
              <p className={sheetDescription}>미리 알려주시면 점수 차감이 줄어들어요.</p>
            </VStack>
            <form.Field
              name="type"
              validators={{ onDynamic: ({ value }) => validateReportType(value) }}
            >
              {(field) => {
                const error = field.state.meta.errors[0];
                return (
                  <RadioGroup
                    label="출결 유형"
                    showRequiredIndicator
                    invalid={Boolean(error)}
                    errorMessage={error}
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (isAttendanceReportType(value)) {
                        field.handleChange(value);
                      }
                      setSubmissionMessage('');
                    }}
                  >
                    {reportTypes.map(({ value, label }, index) => (
                      <RadioGroupItem
                        key={value}
                        value={value}
                        label={label}
                        disabled={report.pending}
                        inputProps={{ 'aria-required': index === 0 || undefined }}
                      />
                    ))}
                  </RadioGroup>
                );
              }}
            </form.Field>
            <ActionButton
              variant="brandSolid"
              size="large"
              className={sheetPrimaryButton}
              type="submit"
              disabled={report.pending}
            >
              다음
            </ActionButton>
          </VStack>
        ) : (
          <VStack gap="x5" width="full">
            <VStack gap="x1_5" width="full">
              <h2 className={sheetTitle}>사유를 입력해 주세요</h2>
              <p className={sheetDescription}>사유는 30자 이내로 입력해 주세요.</p>
            </VStack>
            <form.Field
              name="reason"
              validators={{ onDynamic: ({ value }) => validateReportReason(value) }}
            >
              {(field) => {
                const error = field.state.meta.errors[0];
                return (
                  <TextField
                    label="사유"
                    indicator={
                      <output id={reasonCharacterCountId}>{field.state.value.length}/30</output>
                    }
                    required
                    showRequiredIndicator
                    invalid={Boolean(error)}
                    errorMessage={error}
                    value={field.state.value}
                    onValueChange={({ value }) => {
                      field.handleChange(value);
                      report.reset();
                      setSubmissionMessage('');
                    }}
                  >
                    <TextFieldInput
                      name="reason"
                      placeholder="사유를 입력해 주세요"
                      maxLength={30}
                      autoComplete="off"
                      enterKeyHint="done"
                      disabled={report.pending}
                      aria-describedby={reasonCharacterCountId}
                      onBlur={field.handleBlur}
                    />
                  </TextField>
                );
              }}
            </form.Field>
            {report.error || submissionMessage ? (
              <p role="alert">{report.error || submissionMessage}</p>
            ) : null}
            <ActionButton
              variant="brandSolid"
              size="large"
              className={sheetPrimaryButton}
              type="submit"
              loading={report.pending}
              disabled={report.pending}
            >
              제출하기
            </ActionButton>
            <ActionButton
              type="button"
              variant="ghost"
              className={sheetSecondaryButton}
              disabled={report.pending}
              onClick={onTypeStep}
            >
              이전
            </ActionButton>
          </VStack>
        )}
      </VStack>
    </ReportSheetShell>
  );
}
