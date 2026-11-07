import { HStack, VStack } from '@seed-design/react';
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { useRef, useState } from 'react';
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
        stroke="#FF6600"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AttendanceCodeSheet({
  onComplete,
  ...props
}: BottomSheetRootProps & { onComplete: () => void }) {
  const layerIndex = useActivityZIndexBase();
  const [code, setCode] = useState(['', '', '', '']);
  const [codeError, setCodeError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 코드 입력 핸들러
  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setCodeError(false);

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

  function handleConfirmCode() {
    const fullCode = code.join('');
    if (fullCode.length < 4) {
      setCodeError(true);
      return;
    }
    // 예: 0000이거나 4자리 코드 검증
    if (fullCode === '0000') {
      setCodeError(true);
      return;
    }

    onComplete();
  }

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

        <VStack gap="x5" className={sheetContainer}>
          <VStack gap="x6" width="full">
            <VStack gap="x1_5" width="full">
              <h2 className={sheetTitle}>출석 코드를 입력해 주세요</h2>
              <p className={sheetDescription}>코드를 입력하면 출석이 완료돼요</p>
            </VStack>

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
                    placeholder={focusedIndex === index ? '' : '0'}
                    value={code[index]}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className={codeError ? codeInputError : codeInput}
                    aria-label={`출석 코드 ${index + 1}번째 자리`}
                  />
                ))}
              </div>

              {codeError && (
                <div className={codeErrorMessage} role="alert">
                  <IconExclamationmarkCircleFill width={16} height={16} />
                  <span>출석 코드가 올바르지 않아요.</span>
                </div>
              )}
            </div>
          </VStack>

          <VStack width="full">
            <ActionButton
              variant="brandSolid"
              size="large"
              className={sheetPrimaryButton}
              onClick={handleConfirmCode}
            >
              확인
            </ActionButton>
          </VStack>
        </VStack>
      </BottomSheetContent>
    </BottomSheetRoot>
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
              priority
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
