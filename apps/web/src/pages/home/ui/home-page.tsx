'use client';

import {
  IconCheckmarkCircleFill,
  IconChevronRightFill,
  IconExclamationmarkCircleFill,
  IconLocationpinFill,
} from '@karrotmarket/react-monochrome-icon';
import {
  HelpBubbleAnchor,
  HelpBubbleArrow,
  HelpBubbleArrowTip,
  HelpBubbleBody,
  HelpBubbleContent,
  HelpBubblePositioner,
  HelpBubbleRoot,
  HelpBubbleTitle,
} from '@seed-design/react';
import { CompleteIllustration } from '@/pages/signup-complete/ui/complete-illustration';
import {
  ActionButton,
  BottomSheetContent,
  BottomSheetRoot,
  RadioGroup,
  RadioGroupItem,
} from '@yapp-plus/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  attendanceButton,
  attendedBadge,
  attendedSessionButton,
  calendarDateBadge,
  calendarDateBadgeActive,
  calendarDayItem,
  calendarDayLabel,
  calendarWeek,
  cardsSection,
  charCount,
  chipBlue,
  chipGray,
  chipRow,
  codeErrorMessage,
  codeInput,
  codeInputError,
  codeInputsContainer,
  container,
  content,
  devRoutesLink,
  disabledSessionButton,
  helpBubbleArrowTip,
  helpBubbleContent,
  helpBubbleTitle,
  locationPin,
  locationRow,
  locationText,
  noticeCard,
  noticeChevron,
  noticeContent,
  noticesHeader,
  noticesList,
  noticesSection,
  noticesSectionTitle,
  noticeTitle,
  quickCard,
  quickCardCol,
  quickCardContent,
  quickCardGraphicAttendance,
  quickCardGraphicSession,
  quickCardsGrid,
  quickCardSubtitle,
  quickCardTitle,
  reportRadioGroup,
  reportTextarea,
  sessionCard,
  sessionHeader,
  sessionTitle,
  sheetContainer,
  sheetContent,
  sheetDescription,
  sheetFooter,
  sheetHandleArea,
  sheetHandleBar,
  sheetHeader,
  sheetHomeIndicatorArea,
  sheetPrimaryButton,
  sheetSecondaryButton,
  sheetTitle,
  sheetTopSection,
  codeInputsWrapper,
  snackbar,
  srOnly,
  teamButtonsWrap,
  teamGraphicWrap,
  teamRuleItem,
  teamRulesList,
  textareaContainer,
} from './home-page.css';

const weekSchedule = [
  { day: '일', date: 1, isToday: false, attended: false },
  { day: '월', date: 2, isToday: false, attended: false },
  { day: '화', date: 3, isToday: false, attended: false },
  { day: '수', date: 4, isToday: false, attended: false },
  { day: '목', date: 5, isToday: false, attended: false },
  { day: '금', date: 6, isToday: false, attended: false },
  { day: '토', date: 7, isToday: true, attended: false },
];

const weeklyNotices = [
  {
    id: 1,
    tag: '세션',
    isSession: true,
    title: '5주차 개발-디자인 세션 공지',
    href: '/notices',
  },
  {
    id: 2,
    tag: '기타',
    isSession: false,
    title: '뒷풀이 참석 여부 수요 조사',
    href: '/notices',
  },
  {
    id: 3,
    tag: '기타',
    isSession: false,
    title: '운영진 공지 사항',
    href: '/notices',
  },
];

type AttendanceState = 'before_session' | 'available' | 'attended';
type ReportType = '지각' | '조퇴' | '결석';

function isReportType(value: unknown): value is ReportType {
  return value === '지각' || value === '조퇴' || value === '결석';
}

function extractRadioValue(details: unknown): string | undefined {
  if (typeof details === 'string') {
    return details;
  }
  if (
    details !== null &&
    typeof details === 'object' &&
    'value' in details &&
    typeof details.value === 'string'
  ) {
    return details.value;
  }
  return undefined;
}

export function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTeamSession = searchParams?.get('session') === 'team';
  const attendanceParam = searchParams?.get('attendance');

  // 출석 상태 관리: 파라미터가 'attended'이면 출석 완료, 내부 상태가 있으면 내부 상태 우선
  const [internalAttendanceState, setInternalAttendanceState] = useState<AttendanceState | null>(
    null,
  );
  const attendanceState: AttendanceState =
    internalAttendanceState ?? (attendanceParam === 'attended' ? 'attended' : 'available');

  // 1. 출석 코드 바텀시트
  const [isCodeSheetOpen, setIsCodeSheetOpen] = useState(false);
  const [code, setCode] = useState(['', '', '', '']);
  const [codeError, setCodeError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 2. 팀 세션 인증 안내 바텀시트
  const [isTeamGuideSheetOpen, setIsTeamGuideSheetOpen] = useState(false);

  // 3. 출결 보고 바텀시트
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [reportStep, setReportStep] = useState<1 | 2>(1);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('지각');
  const [reportReason, setReportReason] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

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

    setIsCodeSheetOpen(false);
    setInternalAttendanceState('attended');
    router.push('/attendance/complete');
  }

  // 출결 보고 핸들러
  function handleOpenReport() {
    setReportStep(1);
    setReportReason('');
    setIsReportSheetOpen(true);
  }

  function handleReportNext() {
    setReportStep(2);
  }

  function handleSubmitReport() {
    setIsReportSheetOpen(false);
    setSnackbarMessage('출결 보고를 완료했어요');
    setTimeout(() => {
      setSnackbarMessage(null);
    }, 3000);
  }

  function renderSessionActionButton() {
    if (attendanceState === 'attended') {
      return (
        <ActionButton
          variant="neutralWeak"
          size="medium"
          disabled
          className={attendedSessionButton}
        >
          {isTeamSession ? '인증 사진 검토 중' : '출석했어요!'}
        </ActionButton>
      );
    }

    if (attendanceState === 'before_session') {
      return (
        <ActionButton
          variant="neutralWeak"
          size="medium"
          disabled
          className={disabledSessionButton}
        >
          14:00에 출석할 수 있어요
        </ActionButton>
      );
    }

    return (
      <ActionButton
        variant="neutralSolid"
        size="medium"
        className={attendanceButton}
        onClick={() => {
          if (isTeamSession) {
            setIsTeamGuideSheetOpen(true);
          } else {
            setCode(['', '', '', '']);
            setCodeError(false);
            setIsCodeSheetOpen(true);
          }
        }}
      >
        출석하기
      </ActionButton>
    );
  }

  return (
    <main className={container}>
      <h1 className={srOnly}>홈</h1>

      <div className={content}>
        <section className={cardsSection} aria-label="세션 및 바로가기">
          <div className={sessionCard}>
            <div className={sessionHeader}>
              <div className={locationRow}>
                <span className={locationPin} aria-hidden="true">
                  <IconLocationpinFill width={14} height={14} />
                </span>
                <span className={locationText}>
                  {isTeamSession ? '강남역 모임공간' : 'DMC 첨단산업센터'}
                </span>
              </div>
              <h2 className={sessionTitle}>
                {isTeamSession
                  ? '이번 주는 팀 세션이에요'
                  : '이번 주는 유저 플로우 리뷰 세션이에요'}
              </h2>
            </div>

            <div className={calendarWeek} aria-label="주간 일정">
              {weekSchedule.map((item) => {
                const isAttended = item.isToday && attendanceState === 'attended';
                return (
                  <div key={item.day} className={calendarDayItem}>
                    <span className={calendarDayLabel}>{item.day}</span>
                    <span className={item.isToday ? calendarDateBadgeActive : calendarDateBadge}>
                      {item.date}
                    </span>
                    {isAttended && <span className={attendedBadge}>출석</span>}
                  </div>
                );
              })}
            </div>

            {renderSessionActionButton()}
          </div>

          <nav className={quickCardsGrid} aria-label="홈 바로가기">
            <div className={quickCardCol}>
              <Link href="/schedule" className={quickCard} aria-label="이번 달 전체 세션 확인하기">
                <div className={quickCardContent}>
                  <p className={quickCardTitle}>전체 세션</p>
                  <p className={quickCardSubtitle}>확인하기</p>
                </div>
                <Image
                  src="/images/home/graphic-spot-session.svg"
                  alt=""
                  width={150}
                  height={106}
                  className={quickCardGraphicSession}
                />
              </Link>
            </div>

            <div className={quickCardCol}>
              <HelpBubbleRoot open={attendanceState !== 'attended'} placement="bottom" gutter={6}>
                <HelpBubbleAnchor asChild>
                  <button
                    type="button"
                    className={quickCard}
                    onClick={handleOpenReport}
                    aria-label="출결 보고 미리하기"
                  >
                    <div className={quickCardContent}>
                      <p className={quickCardTitle}>출결 보고</p>
                      <p className={quickCardSubtitle}>미리하기</p>
                    </div>
                    <Image
                      src="/images/home/graphic-spot-attendance.svg"
                      alt=""
                      width={150}
                      height={106}
                      className={quickCardGraphicAttendance}
                    />
                  </button>
                </HelpBubbleAnchor>

                <HelpBubblePositioner>
                  <HelpBubbleContent className={helpBubbleContent}>
                    <HelpBubbleArrow>
                      <HelpBubbleArrowTip className={helpBubbleArrowTip} />
                    </HelpBubbleArrow>
                    <HelpBubbleBody>
                      <HelpBubbleTitle className={helpBubbleTitle}>
                        세션 시작 전에{'\n'}미리 보고해 주세요
                      </HelpBubbleTitle>
                    </HelpBubbleBody>
                  </HelpBubbleContent>
                </HelpBubblePositioner>
              </HelpBubbleRoot>
            </div>
          </nav>
        </section>

        <section className={noticesSection} aria-label="이번 주 공지">
          <div className={noticesHeader}>
            <h2 className={noticesSectionTitle}>이번 주 공지</h2>
          </div>

          <div className={noticesList}>
            {weeklyNotices.map((notice) => (
              <Link
                key={notice.id}
                href={notice.href}
                className={noticeCard}
                aria-label={notice.title}
              >
                <div className={noticeContent}>
                  <div className={chipRow}>
                    <span className={notice.isSession ? chipBlue : chipGray}>{notice.tag}</span>
                  </div>
                  <p className={noticeTitle}>{notice.title}</p>
                </div>
                <span className={noticeChevron} aria-hidden="true">
                  <IconChevronRightFill width={20} height={20} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {process.env.NODE_ENV === 'development' && (
          <Link href="/dev/routes" className={devRoutesLink}>
            개발용 화면 목록
          </Link>
        )}
      </div>

      {/* 1. 출석 코드 입력 바텀시트 */}
      <BottomSheetRoot open={isCodeSheetOpen} onOpenChange={setIsCodeSheetOpen}>
        <BottomSheetContent
          aria-label="출석 코드를 입력해 주세요"
          showHandle={false}
          showCloseButton={false}
          className={sheetContent}
        >
          <div className={sheetHandleArea} aria-hidden="true">
            <div className={sheetHandleBar} />
          </div>

          <div className={sheetContainer}>
            <div className={sheetTopSection}>
              <div className={sheetHeader}>
                <h2 className={sheetTitle}>출석 코드를 입력해 주세요</h2>
                <p className={sheetDescription}>코드를 입력하면 출석이 완료돼요</p>
              </div>

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
            </div>

            <div className={sheetFooter}>
              <ActionButton
                variant="brandSolid"
                size="large"
                className={sheetPrimaryButton}
                onClick={handleConfirmCode}
              >
                확인
              </ActionButton>
              <div className={sheetHomeIndicatorArea} aria-hidden="true" />
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheetRoot>

      {/* 2. 출결 보고 바텀시트 */}
      <BottomSheetRoot open={isReportSheetOpen} onOpenChange={setIsReportSheetOpen}>
        <BottomSheetContent
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

          <div className={sheetContainer}>
            {reportStep === 1 ? (
              <>
                <div className={sheetTopSection}>
                  <div className={sheetHeader}>
                    <h2 className={sheetTitle}>출결을 보고해 주세요</h2>
                    <p className={sheetDescription}>미리 알려주시면 점수 차감이 줄어들어요</p>
                  </div>

                  <RadioGroup
                    value={selectedReportType}
                    onValueChange={(details) => {
                      const next = extractRadioValue(details);
                      if (isReportType(next)) {
                        setSelectedReportType(next);
                      }
                    }}
                    aria-label="출결 유형"
                    className={reportRadioGroup}
                  >
                    {(['지각', '조퇴', '결석'] as const).map((type) => (
                      <RadioGroupItem
                        key={type}
                        value={type}
                        label={type}
                        size="large"
                        tone="brand"
                      />
                    ))}
                  </RadioGroup>
                </div>

                <div className={sheetFooter}>
                  <ActionButton
                    variant="brandSolid"
                    size="large"
                    className={sheetPrimaryButton}
                    onClick={handleReportNext}
                  >
                    확인
                  </ActionButton>
                  <div className={sheetHomeIndicatorArea} aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className={sheetTopSection}>
                  <div className={sheetHeader}>
                    <h2 className={sheetTitle}>{selectedReportType} 사유를 입력해 주세요</h2>
                  </div>

                  <div className={textareaContainer}>
                    <textarea
                      className={reportTextarea}
                      placeholder="사유를 입력해 주세요"
                      maxLength={30}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      aria-label={`${selectedReportType} 사유`}
                    />
                    <div className={charCount}>{reportReason.length}/30</div>
                  </div>
                </div>

                <div className={sheetFooter}>
                  <ActionButton
                    variant="brandSolid"
                    size="large"
                    className={sheetPrimaryButton}
                    onClick={handleSubmitReport}
                  >
                    확인
                  </ActionButton>
                  <div className={sheetHomeIndicatorArea} aria-hidden="true" />
                </div>
              </>
            )}
          </div>
        </BottomSheetContent>
      </BottomSheetRoot>

      {/* 3. 팀 세션 인증 안내 바텀시트 */}
      <BottomSheetRoot open={isTeamGuideSheetOpen} onOpenChange={setIsTeamGuideSheetOpen}>
        <BottomSheetContent
          aria-label="팀 세션 인증 사진을 업로드해 주세요"
          showHandle={false}
          showCloseButton={false}
          className={sheetContent}
        >
          <div className={sheetHandleArea} aria-hidden="true">
            <div className={sheetHandleBar} />
          </div>

          <div className={sheetContainer}>
            <div className={sheetTopSection}>
              <div className={sheetHeader}>
                <h2 className={sheetTitle}>팀 세션 인증 사진을 업로드해 주세요</h2>
                <p className={sheetDescription}>팀원 중 한 명만 올리면 팀 전체에 반영돼요</p>
              </div>

              <div className={teamGraphicWrap} aria-hidden="true">
                <CompleteIllustration />
              </div>

              <ul className={teamRulesList} aria-label="인증 사진 규칙">
                <li className={teamRuleItem}>
                  <IconCheckmarkCircleFill width={16} height={16} />
                  <span>참석한 팀원이 모두 보이게 찍어주세요</span>
                </li>
                <li className={teamRuleItem}>
                  <IconCheckmarkCircleFill width={16} height={16} />
                  <span>세션 시간(14:00 - 18:00) 안에 올려주세요</span>
                </li>
                <li className={teamRuleItem}>
                  <IconCheckmarkCircleFill width={16} height={16} />
                  <span>운영진 확인 후 출석이 확정돼요</span>
                </li>
              </ul>
            </div>

            <div className={sheetFooter}>
              <div className={teamButtonsWrap}>
                <ActionButton
                  variant="neutralWeak"
                  size="large"
                  className={sheetSecondaryButton}
                  onClick={() => {
                    setIsTeamGuideSheetOpen(false);
                    router.push('/team-attendance/upload');
                  }}
                >
                  앨범에서 선택하기
                </ActionButton>
                <ActionButton
                  variant="brandSolid"
                  size="large"
                  className={sheetPrimaryButton}
                  onClick={() => {
                    setIsTeamGuideSheetOpen(false);
                    router.push('/team-attendance/upload');
                  }}
                >
                  직접 사진 찍기
                </ActionButton>
              </div>
              <div className={sheetHomeIndicatorArea} aria-hidden="true" />
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheetRoot>

      {/* 완료 스낵바 */}
      {snackbarMessage && <output className={snackbar}>{snackbarMessage}</output>}
    </main>
  );
}
