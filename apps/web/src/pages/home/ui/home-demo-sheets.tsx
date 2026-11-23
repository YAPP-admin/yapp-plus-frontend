/** 홈에서 사용하는 출석 코드·팀 확인 바텀시트와 입력 상호작용을 제공합니다. */
import { Box, HStack, VStack } from '@seed-design/react';
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { useId, useRef, type ReactNode } from 'react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useErrorBoundary } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { useCodeAttendance } from '../model/code-attendance';
import { IconExclamationmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import {
  ActionButton,
  BottomSheetContent,
  BottomSheetRoot,
  type BottomSheetRootProps,
} from '@yapp-plus/ui';
import { Image } from '@/app/navigation/image';
import { getAttendanceSubmissionFeedback } from './attendance-code-feedback';
import {
  attendanceFeedbackMessage,
  attendanceProgressMessage,
  codeErrorMessage,
  codeInput,
  codeInputError,
  sheetContainer,
  sheetContent,
  sheetDescription,
  sheetHandleArea,
  sheetHandleBar,
  sheetPrimaryButton,
  sheetSecondaryButton,
  sheetTitle,
  teamButtonsWrap,
  teamCheckIcon,
  teamGraphicImage,
  teamGraphicWrap,
  teamRuleItem,
  teamRulesList,
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

const attendanceCodeSchema = z
  .array(z.string())
  .refine((digits) => /^\d{4}$/.test(digits.join('')), '출석 코드 네 자리를 입력해 주세요.');

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
        <HStack
          justify="center"
          align="center"
          width="full"
          className={sheetHandleArea}
          aria-hidden="true"
        >
          <Box className={sheetHandleBar} />
        </HStack>
        <VStack gap="x1_5" className={sheetContainer}>
          <h2 className={sheetTitle}>출석 코드를 입력해 주세요</h2>
          <p className={sheetDescription}>세션 장소 100m 이내에서만 출석할 수 있어요</p>
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
  const isSheetOpen = props.open === true;
  const form = useForm({
    defaultValues: { code: ['', '', '', ''] },
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => submitAttendanceCode(value.code.join('')),
  });
  const attendance = useCodeAttendance(onComplete, isSheetOpen);
  const flowIssue = attendance.issue;

  function submitAttendanceCode(code: string) {
    attendance.submit(code, (message) => {
      form.setFieldMeta('code', (meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onSubmit: { message } },
      }));
    });
  }
  const { progressMessage, submitLabel } = getAttendanceSubmissionFeedback({
    checkingLocation: attendance.checkingLocation,
    submittingAttendance: attendance.submittingAttendance,
    openingSettings: attendance.openingSettings,
    hasLocationIssue: flowIssue?.kind === 'LOCATION',
  });

  return (
    <CodeSheetShell {...props} dismissible={!attendance.isPending}>
      <VStack
        as="form"
        gap="x5"
        className={sheetContainer}
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <VStack gap="x6" width="full">
          <VStack gap="x2_5" align="center" justify="center" width="full">
            <form.Field name="code" validators={{ onDynamic: attendanceCodeSchema }}>
              {(field) => {
                const validationIssue = field.state.meta.errors[0];
                const codeError = validationIssue?.message;
                return (
                  <AttendanceCodeInputGroup
                    value={field.state.value}
                    error={codeError}
                    disabled={attendance.isPending}
                    onBlur={field.handleBlur}
                    onChange={(value) => {
                      field.handleChange(value);
                      attendance.reset();
                    }}
                  />
                );
              }}
            </form.Field>
            {flowIssue && (
              <HStack
                gap="x1"
                align="flex-start"
                justify="center"
                width="full"
                className={attendanceFeedbackMessage}
                role="alert"
              >
                <IconExclamationmarkCircleFill width={16} height={16} aria-hidden="true" />
                <span>{flowIssue.message}</span>
              </HStack>
            )}
            {progressMessage && (
              <output className={attendanceProgressMessage}>{progressMessage}</output>
            )}
          </VStack>
        </VStack>

        <VStack width="full" gap="x2">
          <ActionButton
            variant="brandSolid"
            size="large"
            className={sheetPrimaryButton}
            type="submit"
            loading={attendance.isPending}
            disabled={attendance.disabled}
          >
            {submitLabel}
          </ActionButton>
          {flowIssue?.recovery === 'OPEN_SETTINGS' && (
            <ActionButton
              type="button"
              variant="ghost"
              loading={attendance.openingSettings}
              disabled={attendance.isPending}
              onClick={attendance.openSettings}
            >
              앱 설정 열기
            </ActionButton>
          )}
          {flowIssue?.recovery === 'REFRESH_SESSION' && (
            <ActionButton
              type="button"
              variant="ghost"
              disabled={attendance.isPending}
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

type AttendanceCodeInputGroupProps = Readonly<{
  value: string[];
  error?: string;
  disabled: boolean;
  onBlur: () => void;
  onChange: (value: string[]) => void;
}>;

/** 네 자리 코드 입력의 값 변경·붙여넣기·DOM 포커스 이동만 담당합니다. */
function AttendanceCodeInputGroup({
  value,
  error,
  disabled,
  onBlur,
  onChange,
}: AttendanceCodeInputGroupProps) {
  const errorId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, inputValue: string) {
    if (!/^\d*$/.test(inputValue)) {
      return;
    }
    const nextValue = [...value];
    nextValue[index] = inputValue.slice(-1);
    onChange(nextValue);
    if (inputValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, text: string) {
    if (!/^\d+$/.test(text)) {
      return;
    }
    const digits = text.slice(0, 4 - index).split('');
    onChange(value.map((digit, position) => digits[position - index] ?? digit));
    inputRefs.current[Math.min(index + digits.length, 3)]?.focus();
  }

  return (
    <>
      <HStack gap="x1_5" align="center" justify="center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(index, event.clipboardData.getData('text'));
            }}
            placeholder="0"
            value={value[index]}
            onBlur={onBlur}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className={error ? codeInputError : codeInput}
            aria-label={`출석 코드 ${index + 1}번째 자리`}
          />
        ))}
      </HStack>
      {error && (
        <HStack
          id={errorId}
          gap="x1"
          align="center"
          justify="center"
          className={codeErrorMessage}
          role="alert"
        >
          <IconExclamationmarkCircleFill width={16} height={16} aria-hidden="true" />
          <span>{error}</span>
        </HStack>
      )}
    </>
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
        <HStack
          justify="center"
          align="center"
          width="full"
          className={sheetHandleArea}
          aria-hidden="true"
        >
          <Box className={sheetHandleBar} />
        </HStack>

        <VStack gap="x5" className={sheetContainer}>
          <VStack gap="x1_5" width="full">
            <h2 className={sheetTitle}>팀 세션 인증 사진을 업로드해 주세요</h2>
            <p className={sheetDescription}>팀원 중 한 명만 올리면 팀 전체에 반영돼요</p>
          </VStack>

          <HStack align="center" justify="center" width="full" className={teamGraphicWrap}>
            <Image
              src="/images/home/graphic-team-session.svg"
              alt="팀 세션 인증 안내 일러스트"
              width={337}
              height={158}
              className={teamGraphicImage}
            />
          </HStack>

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
