import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { AttendanceHistoryItemResponse } from '@yapp-plus/api/generated';
import { Box, Grid, HStack, ProgressCircle, Skeleton, VStack } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { useNativeAuthSession } from '@/features/auth';
import { memberScoreQueryOptions } from '@/features/member-attendance';
import { historyQueryOptions } from '../model/history-query';
import { attendanceLabel } from '../model/attendance-status';
import { useLoadMoreObserver } from '../model/use-load-more-observer';

import { AttendanceQueryBoundary } from './attendance-query-boundary';
import { BackButton } from '@/app/navigation/back-button';
import { Image } from '@/app/navigation/image';
import {
  absentChip,
  attendedChip,
  body,
  cardHeader,
  cardStats,
  cardTitle,
  container,
  emptyContainer,
  emptyText,
  header,
  headerSpacer,
  headerTitle,
  lateChip,
  listContainer,
  listSection,
  progressGroup,
  progressLabel,
  progressValue,
  sectionTitle,
  sessionItem,
  sessionName,
  statItem,
  statLabel,
  statValue,
  statusCard,
  topCardSection,
  warningBanner,
  warningText,
} from './attendance-page.css';

const attendanceBadgeStyles: Partial<
  Record<AttendanceHistoryItemResponse['attendanceStatus'], string>
> = {
  ABSENT: absentChip,
  LATE: lateChip,
};

export function AttendancePage() {
  const { phase } = useNativeAuthSession();
  const enabled =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  return (
    <div className={container}>
      <header className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'my' }}
          iconOnly
        />
        <h1 className={headerTitle}>출석 내역</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <Grid as="main" className={body} columns="minmax(0, 1fr)" rows="auto auto 1fr">
        {enabled ? (
          <>
            <AttendanceQueryBoundary
              message="출석 내역을 불러오지 못했어요."
              loading={<AttendanceSkeleton />}
            >
              <AttendanceContent />
            </AttendanceQueryBoundary>
            <Box gridRow="2">
              <AttendanceQueryBoundary
                message="결석 경고 정보를 불러오지 못했어요."
                retryLabel="경고 정보 다시 시도"
              >
                <AbsenceWarning />
              </AttendanceQueryBoundary>
            </Box>
          </>
        ) : (
          <p>출석 내역은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</p>
        )}
      </Grid>
    </div>
  );
}

function AttendanceContent() {
  const { apiOptions } = useNativeAuthSession();
  const options = historyQueryOptions(apiOptions);
  const history = useSuspenseInfiniteQuery(options);
  const currentRecords = history.data.pages.flatMap((page) => page.items);
  const sessionSummary = history.data.pages.at(-1)?.summary;
  const isNone = currentRecords.length === 0 && !history.hasNextPage;
  const loadMoreRef = useLoadMoreObserver(
    history.hasNextPage && !history.isFetching && !history.isError,
    () => {
      void history.fetchNextPage({ cancelRefetch: false });
    },
  );
  const retry = () => {
    void (history.isFetchNextPageError
      ? history.fetchNextPage({ cancelRefetch: false })
      : history.refetch({ cancelRefetch: false }));
  };

  return (
    <>
      <Box as="section" gridRow="1" className={topCardSection} aria-label="세션 현황 요약">
        <div className={statusCard}>
          <div className={cardHeader}>
            <span className={cardTitle}>세션 현황</span>
            <div className={progressGroup}>
              <span className={progressLabel}>진행률</span>
              <span className={progressValue}>—</span>
            </div>
          </div>

          <div className={cardStats}>
            <div className={statItem}>
              <span className={statLabel}>총 세션</span>
              <span className={statValue}>
                {sessionSummary ? `${sessionSummary.totalSessionCount}회` : '—'}
              </span>
            </div>
            <div className={statItem}>
              <span className={statLabel}>남은 세션</span>
              <span className={statValue}>
                {sessionSummary
                  ? `${sessionSummary.totalSessionCount - sessionSummary.startedSessionCount}회`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </Box>

      <VStack as="section" gridRow="3" mt="x10" className={listSection} aria-label="세션 출석 내역">
        <h2 className={sectionTitle}>세션 출석 내역</h2>

        {isNone ? (
          <div className={emptyContainer}>
            <Image src="/images/my/attendance-empty.svg" alt="" width={90} height={74} priority />
            <p className={emptyText}>아직 출석 내역이 없어요</p>
          </div>
        ) : (
          <div className={listContainer}>
            {currentRecords.map((record) => (
              <div key={record.sessionId} className={sessionItem}>
                <span className={sessionName}>{record.sessionName}</span>
                <span className={attendanceBadgeStyles[record.attendanceStatus] ?? attendedChip}>
                  {attendanceLabel(record)}
                </span>
              </div>
            ))}
          </div>
        )}
        {history.isError && (
          <VStack gap="x2" role="alert">
            <p>출석 내역을 새로 불러오지 못했어요. 이전 내용을 표시하고 있어요.</p>
            <ActionButton
              size="small"
              variant="neutralWeak"
              disabled={history.isFetching}
              onClick={retry}
            >
              다시 시도
            </ActionButton>
          </VStack>
        )}
        {history.isFetchingNextPage && (
          <HStack justify="center" py="x4">
            <ProgressCircle.Root
              size="24"
              tone="neutral"
              aria-label="다음 출석 내역을 불러오고 있어요"
            >
              <ProgressCircle.Track />
              <ProgressCircle.Range />
            </ProgressCircle.Root>
          </HStack>
        )}
        <div ref={loadMoreRef} aria-hidden="true" />
      </VStack>
    </>
  );
}

function AbsenceWarning() {
  const { apiOptions } = useNativeAuthSession();
  const score = useSuspenseQuery(memberScoreQueryOptions(apiOptions));
  const showWarning =
    !score.error && score.data.status === 'available' && score.data.score.absentCount >= 10;
  return (
    <>
      {score.error && (
        <VStack gap="x2" role="alert">
          <p>결석 경고 정보를 불러오지 못했어요.</p>
          <ActionButton
            size="small"
            variant="neutralWeak"
            disabled={score.isFetching}
            onClick={() => {
              void score.refetch({ cancelRefetch: false });
            }}
          >
            경고 정보 다시 시도
          </ActionButton>
        </VStack>
      )}
      {showWarning && (
        <HStack mt="x2_5" className={warningBanner} role="alert">
          <Image src="/images/my/info.svg" alt="" width={18} height={18} priority />
          <p className={warningText}>10번 이상 결석하면 재적처리 될 수 있어요. </p>
        </HStack>
      )}
    </>
  );
}

function AttendanceSkeleton() {
  return (
    <>
      <Box as="output" gridRow="1" aria-label="세션 현황을 불러오고 있어요">
        <Skeleton width="full" height="112px" radius="8" />
      </Box>
      <VStack as="output" gridRow="3" mt="x10" aria-label="출석 내역을 불러오고 있어요">
        <Skeleton width="130px" height="lineHeight.t6" />
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <HStack key={row} justify="space-between" align="center" py="x4">
            <Skeleton width="45%" height="lineHeight.t5" />
            <Skeleton width="36px" height="lineHeight.t2" />
          </HStack>
        ))}
      </VStack>
    </>
  );
}
