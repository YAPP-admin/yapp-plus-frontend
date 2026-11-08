'use client';

import { CurrentWeekCard } from './current-week-card';

import { IconLocationpinFill } from '@karrotmarket/react-monochrome-icon';
import {
  HStack,
  VStack,
  HelpBubbleAnchor,
  HelpBubbleCloseButton,
  HelpBubbleArrow,
  HelpBubbleArrowTip,
  HelpBubbleBody,
  HelpBubbleContent,
  HelpBubblePositioner,
  HelpBubbleRoot,
  HelpBubbleTitle,
} from '@seed-design/react';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { useFlow } from '@stackflow/react';
import { Image } from '@/app/navigation/image';
import { TabLink } from '@/app/navigation/tab-link';
import { useState } from 'react';
import {
  attendanceButton,
  attendedBadge,
  attendedSessionButton,
  calendarDateBadge,
  calendarDateBadgeActive,
  calendarDayItem,
  calendarDayLabel,
  calendarWeek,
  container,
  content,
  helpBubbleArrowTip,
  helpBubbleContent,
  helpBubbleTitle,
  locationPin,
  locationRow,
  locationText,
  quickCard,
  quickCardCol,
  quickCardContent,
  quickCardGraphicAttendance,
  quickCardGraphicSession,
  quickCardsGrid,
  quickCardSubtitle,
  quickCardTitle,
  reportCardButton,
  sessionButtonWrapper,
  teamSessionButton,
  sessionCard,
  sessionHeader,
  sessionHeaderTop,
  sessionToggleChip,
  sessionTitle,
  srOnly,
} from './home-page.css';
import { WeeklyNotices } from './weekly-notices';

const weekSchedule = [
  { day: '일', date: 1, isToday: false, attended: false },
  { day: '월', date: 2, isToday: false, attended: false },
  { day: '화', date: 3, isToday: false, attended: false },
  { day: '수', date: 4, isToday: false, attended: false },
  { day: '목', date: 5, isToday: false, attended: false },
  { day: '금', date: 6, isToday: false, attended: false },
  { day: '토', date: 7, isToday: true, attended: false },
];

type AttendanceState = 'available' | 'attended';

export function HomePage({
  initialSession,
  initialAttendance,
}: {
  initialSession?: 'team';
  initialAttendance?: 'attended';
} = {}) {
  const flow = useFlow();
  const canPreview = import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';
  const [internalSessionMode, setInternalSessionMode] = useState<'team' | 'offline' | null>(null);
  const showDemo =
    canPreview && Boolean(internalSessionMode ?? initialSession ?? initialAttendance);
  const isTeamSession =
    (internalSessionMode ?? (initialSession === 'team' ? 'team' : 'offline')) === 'team';

  const attendanceState: AttendanceState =
    initialAttendance === 'attended' ? 'attended' : 'available';

  function openCodeSheet() {
    if (canPreview) {
      flow.push('AttendanceCode', {});
    }
  }

  function handleOpenReport() {
    if (canPreview) {
      flow.push('AttendanceReport', {});
    }
  }

  function openTeamGuide() {
    if (canPreview) {
      flow.push('TeamAttendanceGuide', {});
    }
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

    // 팀 세션일 때: 피그마 #810:11509 규격 ("인증 사진 올리기" + 하단 툴팁)
    if (isTeamSession) {
      return (
        <div className={sessionButtonWrapper}>
          <HelpBubbleRoot unmountOnExit defaultOpen placement="bottom" gutter={6}>
            <HelpBubbleAnchor asChild>
              <HelpBubbleCloseButton asChild>
                <ActionButton
                  variant="neutralSolid"
                  size="medium"
                  className={teamSessionButton}
                  onClick={openTeamGuide}
                >
                  인증 사진 올리기
                </ActionButton>
              </HelpBubbleCloseButton>
            </HelpBubbleAnchor>

            <HelpBubblePositioner>
              <HelpBubbleContent className={helpBubbleContent}>
                <HelpBubbleArrow>
                  <HelpBubbleArrowTip className={helpBubbleArrowTip} />
                </HelpBubbleArrow>
                <HelpBubbleBody>
                  <HelpBubbleTitle className={helpBubbleTitle}>
                    팀원 중 한 명만{'\n'}인증하면 돼요
                  </HelpBubbleTitle>
                </HelpBubbleBody>
              </HelpBubbleContent>
            </HelpBubblePositioner>
          </HelpBubbleRoot>
        </div>
      );
    }

    return (
      <ActionButton
        variant="neutralSolid"
        size="medium"
        className={attendanceButton}
        onClick={openCodeSheet}
      >
        출석하기
      </ActionButton>
    );
  }

  return (
    <VStack as="main" className={container}>
      <h1 className={srOnly}>홈</h1>

      <VStack gap="x10" className={content}>
        <VStack as="section" gap="x2_5" aria-label="세션 및 바로가기">
          {showDemo ? (
            <div className={sessionCard}>
              <div className={sessionHeader}>
                <div className={sessionHeaderTop}>
                  <div className={locationRow}>
                    <span className={locationPin} aria-hidden="true">
                      <IconLocationpinFill width={14} height={14} />
                    </span>
                    <span className={locationText}>
                      {isTeamSession ? '팀별 자율 장소' : 'DMC 첨단산업센터'}
                    </span>
                  </div>
                  <ActionButton
                    variant="ghost"
                    size="small"
                    type="button"
                    className={sessionToggleChip}
                    onClick={() => setInternalSessionMode(isTeamSession ? 'offline' : 'team')}
                    aria-label={isTeamSession ? '정기 세션 화면으로 전환' : '팀 세션 화면으로 전환'}
                  >
                    {isTeamSession ? '정기 세션 보기' : '팀 세션 보기'}
                  </ActionButton>
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
                      {isAttended && (
                        <Badge variant="weak" tone="brand" className={attendedBadge}>
                          출석
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {renderSessionActionButton()}
            </div>
          ) : (
            <CurrentWeekCard />
          )}

          <HStack
            as="nav"
            gap="x2_5"
            align="stretch"
            className={quickCardsGrid}
            aria-label="홈 바로가기"
          >
            <VStack className={quickCardCol}>
              <TabLink tab="schedule" className={quickCard} aria-label="전체 세션 확인하기">
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
              </TabLink>
            </VStack>

            <VStack className={quickCardCol}>
              <HelpBubbleRoot
                unmountOnExit
                defaultOpen={canPreview && attendanceState !== 'attended'}
                placement="bottom"
                gutter={6}
              >
                <HelpBubbleAnchor asChild>
                  <HelpBubbleCloseButton asChild>
                    <ActionButton
                      variant="ghost"
                      size="small"
                      type="button"
                      className={reportCardButton}
                      disabled={!canPreview}
                      onClick={handleOpenReport}
                      aria-label={canPreview ? '출결 보고 미리하기' : '출결 보고 준비 중'}
                      data-testid="report-attendance-button"
                    >
                      <span className={quickCard}>
                        <span className={quickCardContent}>
                          <span className={quickCardTitle}>출결 보고</span>
                          <span className={quickCardSubtitle}>
                            {canPreview ? '미리하기' : '준비 중'}
                          </span>
                        </span>
                        <Image
                          src="/images/home/graphic-spot-attendance.svg"
                          alt=""
                          width={150}
                          height={106}
                          className={quickCardGraphicAttendance}
                        />
                      </span>
                    </ActionButton>
                  </HelpBubbleCloseButton>
                </HelpBubbleAnchor>

                {canPreview ? (
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
                ) : null}
              </HelpBubbleRoot>
            </VStack>
          </HStack>
        </VStack>

        <WeeklyNotices />
      </VStack>
    </VStack>
  );
}
