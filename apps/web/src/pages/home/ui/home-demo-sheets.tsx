import { HStack, VStack } from '@seed-design/react';
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { useId, useRef, useState, type ReactNode } from 'react';
import { revalidateLogic, useField, useForm } from '@tanstack/react-form';
import { useErrorBoundary } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { useCodeAttendance } from '../model/code-attendance';
import { IconExclamationmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import {
  ActionButton,
  RadioGroup,
  RadioGroupItem,
  BottomSheetContent,
  BottomSheetRoot,
  type BottomSheetRootProps,
  TextField,
  TextFieldTextarea,
} from '@yapp-plus/ui';
import { Image } from '@/app/navigation/image';
import {
  codeErrorMessage,
  codeInput,
  codeInputError,
  codeInputsContainer,
  reportTextFieldRoot,
  reportTextFieldTextarea,
  sheetContainer,
  sheetContent,
  sheetDescription,
  sheetHandleArea,
  sheetHandleBar,
  sheetPrimaryButton,
  sheetSecondaryButton,
  sheetTitle,
  codeInputsWrapper,
  teamButtonsWrap,
  teamCheckIcon,
  teamGraphicImage,
  teamGraphicWrap,
  teamRuleItem,
  teamRulesList,
  textareaContainer,
} from './home-page.css';

function OrangeCheckIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={teamCheckIcon}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type AttendanceCodeSheetProps = BottomSheetRootProps & { onComplete: () => void };

export function AttendanceCodeSheet({ onComplete, ...props }: AttendanceCodeSheetProps) {
  const { isNative } = useNativeAuthSession();
  const mockBrowser = import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';
  if (!isNative && !mockBrowser) {
    return (
      <CodeSheetShell {...props}>
        <CodeSheetMessage message="앱에 로그인한 후 출석해 주세요." />
      </CodeSheetShell>
    );
  }
  return (
    <QueryBoundary
      errorFallback={
        <CodeSheetShell {...props}>
          <CodeSheetError />
        </CodeSheetShell>
      }
      pendingFallback={
        <CodeSheetShell {...props}>
          <CodeSheetMessage message="세션을 불러오고 있어요…" />
        </CodeSheetShell>
      }
    >
      <AttendanceCodeContent {...props} onComplete={onComplete} />
    </QueryBoundary>
  );
}

function CodeSheetShell({ children, ...props }: BottomSheetRootProps & { children: ReactNode }) {
  const layerIndex = useActivityZIndexBase();
  return (
    <BottomSheetRoot {...props}>
      <BottomSheetContent
        layerIndex={layerIndex}
        aria-label="출석 코드를 입력해 주세요"
        showHandle={false}
        showCloseButton={false}
        className={sheetContent}
      >
        <div className={sheetHandleArea} aria-hidden="true">
          <div className={sheetHandleBar} />
        </div>
        <VStack gap="x1_5" className={sheetContainer}>
          <h2 className={sheetTitle}>출석 코드를 입력해 주세요</h2>
          <p className={sheetDescription}>코드를 입력하면 출석이 완료돼요</p>
        </VStack>
        {children}
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}

function CodeSheetError() {
  const { resetBoundary } = useErrorBoundary();
  return (
    <CodeSheetMessage
      message="세션을 불러오지 못했어요. 다시 확인해 주세요."
      retry={resetBoundary}
    />
  );
}

function CodeSheetMessage({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <VStack gap="x5" className={sheetContainer}>
      <p role={retry ? 'alert' : 'status'}>{message}</p>
      <ActionButton variant="brandSolid" size="large" className={sheetPrimaryButton} disabled>
        확인
      </ActionButton>
      {retry && (
        <ActionButton variant="ghost" onClick={retry}>
          세션 다시 확인
        </ActionButton>
      )}
    </VStack>
  );
}

function AttendanceCodeContent({ onComplete, ...props }: AttendanceCodeSheetProps) {
  const attendance = useCodeAttendance(onComplete);
  const form = useForm({
    defaultValues: { code: ['', '', '', ''] },
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => attendance.submit(value.code.join('')),
  });
  const field = useField({
    form,
    name: 'code',
    validators: {
      onDynamic: ({ value }) =>
        value.every((digit) => /^\d$/.test(digit))
          ? undefined
          : '출석 코드 네 자리를 입력해 주세요.',
    },
  });
  const code = field.state.value;
  const error = field.state.meta.errors[0] ?? attendance.error;
  const errorId = useId();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 코드 입력 핸들러
  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    field.handleChange(newCode);
    attendance.reset();

    // 다음 칸으로 자동 포커스
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, text: string) {
    if (!/^\d+$/.test(text)) {
      return;
    }
    const digits = text.slice(0, 4 - index).split('');
    field.handleChange((previous) => previous.map((digit, i) => digits[i - index] ?? digit));
    attendance.reset();
    inputRefs.current[Math.min(index + digits.length, 3)]?.focus();
  }

  return (
    <CodeSheetShell {...props} dismissible={!attendance.pending}>
      <VStack
        as="form"
        gap="x5"
        className={sheetContainer}
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.state.isSubmitting) {
            void form.handleSubmit();
          }
        }}
      >
        <VStack gap="x6" width="full">
          <div className={codeInputsWrapper}>
            <div className={codeInputsContainer}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="off"
                  disabled={attendance.pending}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  onPaste={(event) => {
                    event.preventDefault();
                    handlePaste(index, event.clipboardData.getData('text'));
                  }}
                  placeholder={focusedIndex === index ? '' : '0'}
                  value={code[index]}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => {
                    field.handleBlur();
                    setFocusedIndex(null);
                  }}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className={error ? codeInputError : codeInput}
                  aria-label={`출석 코드 ${index + 1}번째 자리`}
                />
              ))}
            </div>

            {error && (
              <div id={errorId} className={codeErrorMessage} role="alert">
                <IconExclamationmarkCircleFill width={16} height={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </VStack>

        <VStack width="full">
          <ActionButton
            variant="brandSolid"
            size="large"
            className={sheetPrimaryButton}
            type="submit"
            loading={attendance.pending}
            disabled={attendance.disabled}
          >
            확인
          </ActionButton>
          {error && (
            <ActionButton
              type="button"
              variant="ghost"
              disabled={attendance.pending}
              onClick={attendance.refresh}
            >
              세션 다시 확인
            </ActionButton>
          )}
        </VStack>
      </VStack>
    </CodeSheetShell>
  );
}
export function AttendanceReportSheet({
  onComplete,
  ...props
}: BottomSheetRootProps & { onComplete: () => void }) {
  const layerIndex = useActivityZIndexBase();
  const [reportStep, setReportStep] = useState<1 | 2>(1);
  const [selectedReportType, setSelectedReportType] = useState('지각');
  const [reportReason, setReportReason] = useState('');

  return (
    <BottomSheetRoot {...props}>
      <BottomSheetContent
        layerIndex={layerIndex}
        aria-label={
          reportStep === 1 ? '출결을 보고해 주세요' : `${selectedReportType} 사유를 입력해 주세요`
        }
        showHandle={false}
        showCloseButton={false}
        className={sheetContent}
      >
        <div className={sheetHandleArea} aria-hidden="true">
          <div className={sheetHandleBar} />
        </div>

        <VStack gap="x5" className={sheetContainer}>
          {reportStep === 1 ? (
            <>
              <VStack gap="x1_5" width="full">
                <h2 className={sheetTitle}>출결을 보고해 주세요</h2>
                <p className={sheetDescription}>미리 알려주시면 점수 차감이 줄어들어요</p>
              </VStack>

              <RadioGroup
                label="출결 유형"
                value={selectedReportType}
                onValueChange={setSelectedReportType}
              >
                {['지각', '조퇴', '결석'].map((type) => (
                  <RadioGroupItem key={type} value={type} label={type} />
                ))}
              </RadioGroup>

              <ActionButton
                variant="brandSolid"
                size="large"
                className={sheetPrimaryButton}
                onClick={() => setReportStep(2)}
                data-testid="report-step1-submit"
              >
                확인
              </ActionButton>
            </>
          ) : (
            <>
              <VStack gap="x1_5" width="full">
                <h2 className={sheetTitle}>{selectedReportType} 사유를 입력해 주세요</h2>
              </VStack>

              <div className={textareaContainer}>
                <TextField
                  className={reportTextFieldRoot}
                  maxGraphemeCount={30}
                  value={reportReason}
                  onValueChange={(details) => setReportReason(details.value)}
                >
                  <TextFieldTextarea
                    className={reportTextFieldTextarea}
                    placeholder="사유를 입력해 주세요"
                    maxLength={30}
                    aria-label={`${selectedReportType} 사유`}
                    data-testid="report-reason-input"
                  />
                </TextField>
              </div>

              <ActionButton
                variant="brandSolid"
                size="large"
                className={sheetPrimaryButton}
                onClick={onComplete}
                data-testid="report-step2-submit"
              >
                확인
              </ActionButton>
            </>
          )}
        </VStack>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
export function TeamGuideSheet({
  onComplete,
  ...props
}: BottomSheetRootProps & { onComplete: () => void }) {
  const layerIndex = useActivityZIndexBase();
  return (
    <BottomSheetRoot {...props}>
      <BottomSheetContent
        layerIndex={layerIndex}
        aria-label="팀 세션 인증 사진을 업로드해 주세요"
        showHandle={false}
        showCloseButton={false}
        className={sheetContent}
      >
        <div className={sheetHandleArea} aria-hidden="true">
          <div className={sheetHandleBar} />
        </div>

        <VStack gap="x5" className={sheetContainer}>
          <VStack gap="x1_5" width="full">
            <h2 className={sheetTitle}>팀 세션 인증 사진을 업로드해 주세요</h2>
            <p className={sheetDescription}>팀원 중 한 명만 올리면 팀 전체에 반영돼요</p>
          </VStack>

          <div className={teamGraphicWrap}>
            <Image
              src="/images/home/graphic-team-session.svg"
              alt="팀 세션 인증 안내 일러스트"
              width={337}
              height={158}
              className={teamGraphicImage}
            />
          </div>

          <VStack as="ul" gap="x2" className={teamRulesList} aria-label="인증 사진 규칙">
            <HStack as="li" align="center" gap="x2" className={teamRuleItem}>
              <OrangeCheckIcon />
              <span>참석한 팀원이 모두 보이게 찍어주세요</span>
            </HStack>
            <HStack as="li" align="center" gap="x2" className={teamRuleItem}>
              <OrangeCheckIcon />
              <span>세션 시간(14:00 - 18:00) 안에 올려주세요</span>
            </HStack>
            <HStack as="li" align="center" gap="x2" className={teamRuleItem}>
              <OrangeCheckIcon />
              <span>운영진 확인 후 출석이 확정돼요</span>
            </HStack>
          </VStack>

          <VStack width="full">
            <VStack gap="x2" className={teamButtonsWrap}>
              <ActionButton
                variant="neutralWeak"
                size="large"
                className={sheetSecondaryButton}
                onClick={onComplete}
              >
                앨범에서 선택하기
              </ActionButton>
              <ActionButton
                variant="brandSolid"
                size="large"
                className={sheetPrimaryButton}
                onClick={onComplete}
              >
                직접 사진 찍기
              </ActionButton>
            </VStack>
          </VStack>
        </VStack>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
