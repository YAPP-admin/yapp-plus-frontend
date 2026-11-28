/** 사전 출결 보고의 유형 선택·사유 입력·서버 제출을 바텀시트로 연결합니다. */
import { AttendanceReportLoading } from './attendance-sheet-loading';
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { Checkbox, VStack } from '@seed-design/react';
import { IconCheckmarkLine } from '@karrotmarket/react-monochrome-icon';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import {
  ActionButton,
  BottomSheetContent,
  BottomSheetRoot,
  TextField,
  TextFieldTextarea,
  type BottomSheetRootProps,
} from '@yapp-plus/ui';
import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import { staticContentEnabled } from '@/features/static-content';
import { formatKoreanTime } from '@/shared/lib/korean-date-time';
import { ErrorState } from '@/shared/ui/error-state';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import {
  attendanceReportInputSchema,
  type AttendanceReportInput,
  useAttendanceReport,
} from '../model/attendance-report';
import {
  sheetContainer,
  sheetContent,
  sheetDescription,
  reportHandleArea,
  sheetHandleBar,
  sheetPrimaryButton,
  sheetSecondaryButton,
  sheetTitle,
  reportTypeGroup,
  reportTypeOption,
  reportForm,
  reportReasonFooter,
  reportReasonTextarea,
  reportCount,
  reportCountValue,
  srOnly,
} from './home-page.css';

const REPORT_TYPES = [
  { value: 'LATE', label: '지각', example: '교통 체증으로 1시간 지각 예정입니다.' },
  {
    value: 'EARLY_LEAVE',
    label: '조퇴',
    example: '코딩 테스트 일정으로 30분 일찍 조퇴해야 합니다.',
  },
  { value: 'ABSENT', label: '결석', example: '건강상의 이유로 결석합니다.' },
] as const;

export type AttendanceReportStep = 'type' | 'reason';

type AttendanceReportSheetProps = BottomSheetRootProps & {
  step: AttendanceReportStep;
  onReasonStep: () => void;
  onTypeStep: () => void;
  onComplete: () => void;
};

type AttendanceReportContentProps = {
  titleId: string;
  step: AttendanceReportStep;
  onReasonStep: () => void;
  onTypeStep: () => void;
  onComplete: () => void;
};

function validateReportType(value: AttendanceReportInput['types']) {
  const parsed = attendanceReportInputSchema.shape.types.safeParse(value);
  return parsed.success ? undefined : parsed.error.issues[0]?.message;
}

function validateReportReason(value: string) {
  const parsed = attendanceReportInputSchema.shape.reason.safeParse(value);
  return parsed.success ? undefined : (parsed.error.issues[0]?.message ?? '사유를 확인해 주세요.');
}

/** 인증·정적 콘텐츠 제한과 현재 주간 조회 상태를 보고 시트 안에서 표시합니다. */
export function AttendanceReportSheet({
  step,
  onReasonStep,
  onTypeStep,
  onComplete,
  ...props
}: AttendanceReportSheetProps) {
  const { isNative } = useNativeAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();

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
    <ReportSheetShell {...props} step={step} titleId={titleId} dismissible={!isSubmitting}>
      <LocalErrorBoundary fallbackRender={renderReportError}>
        <Suspense fallback={<AttendanceReportLoading step={step} />}>
          <AttendanceReportContent
            titleId={titleId}
            step={step}
            onReasonStep={onReasonStep}
            onTypeStep={onTypeStep}
            onComplete={onComplete}
            onSubmittingChange={setIsSubmitting}
          />
        </Suspense>
      </LocalErrorBoundary>
    </ReportSheetShell>
  );
}

function ReportSheetShell({
  children,
  step,
  titleId,
  ...props
}: BottomSheetRootProps & { children: ReactNode; step: AttendanceReportStep; titleId?: string }) {
  const layerIndex = useActivityZIndexBase();
  const title = step === 'type' ? '출결을 보고해 주세요' : '사유를 입력해 주세요';

  return (
    <BottomSheetRoot {...props}>
      <BottomSheetContent
        layerIndex={layerIndex}
        aria-label={title}
        aria-labelledby={titleId}
        showHandle={false}
        showCloseButton={false}
        className={sheetContent}
      >
        <div className={reportHandleArea} aria-hidden="true">
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

function renderReportError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="section"
      title="출결 보고 정보를 불러오지 못했어요"
      titleAs="h2"
      retryLabel="보고 다시 확인"
      onRetry={resetErrorBoundary}
    />
  );
}

function AttendanceReportContent({
  titleId,
  step,
  onReasonStep,
  onTypeStep,
  onComplete,
  onSubmittingChange,
}: AttendanceReportContentProps & { onSubmittingChange: (isSubmitting: boolean) => void }) {
  const report = useAttendanceReport(onComplete);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const reasonCharacterCountId = useId();
  const typeErrorId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm({
    defaultValues: report.initialValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmitInvalid: () =>
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]:is(input, textarea)')
        ?.focus(),
    onSubmit: ({ value }) => {
      setSubmissionMessage(report.submit(value) ?? '');
    },
  });

  useEffect(() => {
    onSubmittingChange(report.pending);
    return () => onSubmittingChange(false);
  }, [onSubmittingChange, report.pending]);

  if (!report.target) {
    return <ReportSheetMessage message="이번 주에는 보고할 세션이 없어요." />;
  }
  if (!report.reportable) {
    return (
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
    );
  }

  async function handleNextStep() {
    if (report.pending) {
      return;
    }
    await form.validateField('types', 'submit');
    if (form.getFieldMeta('types')?.isValid) {
      onReasonStep();
    } else {
      formRef.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!report.pending) {
      setSubmissionMessage('');
      void form.handleSubmit();
    }
  }

  return (
    <form
      className={`${sheetContainer} ${reportForm}`}
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
    >
      {step === 'type' ? (
        <VStack gap="x5" width="full">
          <VStack gap="x1_5" width="full">
            <h2 id={titleId} className={sheetTitle}>
              출결을 보고해 주세요
            </h2>
            <p className={sheetDescription}>미리 알려주시면 점수 차감이 줄어들어요.</p>
          </VStack>
          <form.Field
            name="types"
            validators={{ onDynamic: ({ value }) => validateReportType(value) }}
          >
            {(field) => {
              const error = field.state.meta.errors[0];
              return (
                <VStack as="fieldset" gap="x2_5" className={reportTypeGroup}>
                  <legend className={srOnly}>출결 유형</legend>
                  {REPORT_TYPES.map(({ value, label }) => (
                    <Checkbox.Root
                      key={value}
                      className={reportTypeOption}
                      checked={field.state.value.includes(value)}
                      disabled={report.pending}
                      onCheckedChange={(checked) => {
                        let types = field.state.value.filter((type) => type !== value);
                        if (checked) {
                          types =
                            value === 'ABSENT'
                              ? [value]
                              : [...types.filter((type) => type !== 'ABSENT'), value];
                        }
                        field.handleChange(types);
                        field.setErrorMap({ onDynamic: undefined });
                        report.reset();
                        setSubmissionMessage('');
                      }}
                    >
                      <Checkbox.HiddenInput
                        name="types"
                        value={value}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? typeErrorId : undefined}
                      />
                      <Checkbox.Label>{label}</Checkbox.Label>
                      <Checkbox.Control>
                        <Checkbox.Indicator checked={<IconCheckmarkLine />} />
                      </Checkbox.Control>
                    </Checkbox.Root>
                  ))}
                  {error ? (
                    <p id={typeErrorId} role="alert">
                      {error}
                    </p>
                  ) : null}
                </VStack>
              );
            }}
          </form.Field>
          <ActionButton
            variant="brandSolid"
            size="large"
            className={sheetPrimaryButton}
            type="button"
            onClick={() => void handleNextStep()}
            disabled={report.pending}
          >
            다음
          </ActionButton>
        </VStack>
      ) : (
        <VStack gap="x5" width="full">
          <form.Subscribe selector={(state) => state.values.types}>
            {(types) => {
              const selected = REPORT_TYPES.filter(({ value }) => types.includes(value));
              return (
                <VStack gap="x1_5" width="full">
                  <h2 id={titleId} className={sheetTitle}>
                    {selected.map(({ label }) => label).join('·')} 사유를 입력해 주세요
                  </h2>
                  <p className={sheetDescription}>
                    [예시]{' '}
                    {selected.length === 2
                      ? '교통 체증으로 지각하고 코딩 테스트로 조퇴합니다.'
                      : selected[0]?.example}
                  </p>
                </VStack>
              );
            }}
          </form.Subscribe>
          <form.Field
            name="reason"
            validators={{
              onDynamic: ({ value }) => validateReportReason(value),
            }}
          >
            {(field) => {
              const error = field.state.meta.errors[0];
              return (
                <VStack gap="x2" width="full">
                  <TextField
                    size="large"
                    required
                    invalid={Boolean(error)}
                    errorMessage={error}
                    value={field.state.value}
                    onValueChange={({ value }) => {
                      field.handleChange(value);
                      report.reset();
                      setSubmissionMessage('');
                    }}
                  >
                    <TextFieldTextarea
                      name="reason"
                      aria-label="사유"
                      className={reportReasonTextarea}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && event.nativeEvent.isComposing) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="사유를 입력해 주세요"
                      autoComplete="off"
                      enterKeyHint="done"
                      disabled={report.pending}
                      aria-describedby={reasonCharacterCountId}
                      onBlur={field.handleBlur}
                    />
                  </TextField>
                  <div className={reportReasonFooter} id={reasonCharacterCountId}>
                    <output className={reportCount}>
                      <span className={reportCountValue}>
                        {Array.from(field.state.value).length}
                      </span>
                      <span>/30</span>
                    </output>
                  </div>
                </VStack>
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
            {report.editing ? '수정하기' : '제출하기'}
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
    </form>
  );
}
