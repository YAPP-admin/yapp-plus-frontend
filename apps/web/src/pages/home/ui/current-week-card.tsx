import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { find3Options } from '@yapp-plus/api/generated';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { HStack, Skeleton, VStack, VisuallyHidden } from '@seed-design/react';
import { Suspense } from 'react';
import { useFlow } from '@stackflow/react';
import { useAttendanceConfirmation } from '../model/code-attendance';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import {
  formatKoreanTime,
  koreanDateString,
  koreanTimestamp,
  nextKoreanMidnight,
} from '@/shared/lib/korean-date-time';
import { currentWeekSchema } from '../model/current-week-schema';
import {
  calendarDateBadge,
  calendarDateBadgeActive,
  calendarDateToday,
  calendarDayItem,
  calendarDayLabel,
  calendarWeek,
  locationText,
  sessionCard,
  sessionHeader,
  sessionTitle,
} from './home-page.css';

export function CurrentWeekCard() {
  const { phase } = useNativeAuthSession();
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  return (
    <section className={sessionCard} aria-label="이번 주 세션">
      {canQuery ? (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary onReset={reset} FallbackComponent={WeekError}>
              <Suspense fallback={<CurrentWeekLoading />}>
                <CurrentWeekContent />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      ) : (
        <output>세션은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
      )}
    </section>
  );
}

function CurrentWeekLoading() {
  return (
    <>
      <VisuallyHidden asChild>
        <output>이번 주 세션을 불러오고 있어요…</output>
      </VisuallyHidden>
      <VStack gap="x4" aria-hidden="true">
        <Skeleton width="35%" height="lineHeight.t3" />
        <Skeleton width="80%" height="lineHeight.t7" />
        <HStack justify="space-between" width="full">
          {Array.from({ length: 7 }, (_, day) => (
            <Skeleton key={day} width="24px" height="48px" />
          ))}
        </HStack>
        <Skeleton width="full" height="40px" radius="8" />
      </VStack>
    </>
  );
}

function WeekError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ResultSection
      role="alert"
      size="medium"
      title="이번 주 세션을 불러오지 못했어요"
      primaryActionProps={{ children: '다시 시도', onClick: resetErrorBoundary }}
    />
  );
}

function CurrentWeekContent() {
  const { apiOptions } = useNativeAuthSession();
  const flow = useFlow();
  const confirmed = useAttendanceConfirmation();
  const { data, dataUpdatedAt, error, refetch } = useSuspenseQuery({
    ...find3Options({
      ...apiOptions,
      responseValidator: (response) => currentWeekSchema.parseAsync(response),
    }),
    refetchOnMount: (query) =>
      query.state.data && nextKoreanMidnight(query.state.data.weekEndDate) <= Date.now()
        ? 'always'
        : true,
    refetchOnWindowFocus: (query) =>
      query.state.data && nextKoreanMidnight(query.state.data.weekEndDate) <= Date.now()
        ? 'always'
        : true,
  });
  const today = koreanDateString(dataUpdatedAt);
  const days = Array.from({ length: 7 }, (_, index) => {
    const timestamp = koreanTimestamp(data.weekStartDate) + index * 86_400_000;
    return {
      date: koreanDateString(timestamp),
      label: new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'Asia/Seoul' }).format(
        timestamp,
      ),
    };
  });
  const session = data.session;
  return (
    <>
      {error ? (
        <div role="alert">
          이번 주 세션을 새로 불러오지 못했어요. 이전 내용을 표시하고 있어요.
          <ActionButton
            variant="neutralWeak"
            size="small"
            onClick={() => {
              void refetch({ cancelRefetch: false });
            }}
          >
            다시 시도
          </ActionButton>
        </div>
      ) : null}
      <div className={sessionHeader}>
        <span className={locationText}>{session?.location ?? '이번 주 세션'}</span>
        <h2 className={sessionTitle}>
          {session
            ? `${session.date === today ? '오늘은' : '이번 주는'} ${session.name}`
            : '이번 주 예정된 세션이 없어요'}
        </h2>
        {session ? <p>{formatKoreanTime(session.startTime)} 시작</p> : null}
      </div>
      <div className={calendarWeek} aria-label="주간 일정">
        {days.map(({ date, label }) => (
          <div key={date} className={calendarDayItem}>
            <span className={calendarDayLabel}>{label}</span>
            <time
              dateTime={date}
              aria-current={date === today ? 'date' : undefined}
              aria-label={`${date}${date === session?.date ? ' 세션 예정' : ''}`}
              className={`${date === session?.date ? calendarDateBadgeActive : calendarDateBadge} ${date === today ? calendarDateToday : ''}`}
            >
              {Number(date.slice(8))}
            </time>
          </div>
        ))}
      </div>
      {session ? (
        <>
          <ActionButton
            variant="neutralWeak"
            size="medium"
            disabled={
              !!error || confirmed === session.sessionId || session.attendanceStatus !== 'AVAILABLE'
            }
            onClick={() => flow.push('AttendanceCode', {})}
          >
            {confirmed === session.sessionId
              ? '출석했어요!'
              : {
                  AVAILABLE: '출석하기',
                  NOT_ELIGIBLE: '출석 대상이 아니에요',
                  NOT_OPEN: '아직 출석할 수 없어요',
                }[session.attendanceStatus]}
          </ActionButton>
        </>
      ) : null}
    </>
  );
}
