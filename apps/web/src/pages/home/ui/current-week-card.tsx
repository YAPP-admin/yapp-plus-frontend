/** 주간 조회의 세션·본인 출석 상태를 홈 달력과 출석 진입 UI에 반영한다. */
import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';
import { staticContentEnabled } from '@/features/static-content';
import { useRefetchOnScreenReturn, useScreenActiveContext } from '@/shared/lib/screen-activity';
import { useThrowQueryError } from '@/shared/lib/query-error-policy';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  find1Options,
  type CurrentWeekSessionDetailResponse,
  type UserTeamPhotoDetailResponse,
} from '@yapp-plus/api/generated';
import { ActionButton } from '@yapp-plus/ui';
import { HStack, Skeleton, VStack, VisuallyHidden } from '@seed-design/react';
import { Suspense } from 'react';
import { useFlow } from '@stackflow/react';
import { IconCameraFill } from '@karrotmarket/react-monochrome-icon';
import type { FallbackProps } from 'react-error-boundary';
import { Image } from '@/app/navigation/image';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import { useNativeAuthSession } from '@/features/auth';
import {
  formatKoreanTime,
  koreanDateString,
  koreanTimestamp,
  nextKoreanMidnight,
} from '@/shared/lib/korean-date-time';
import { currentWeekQueryOptions } from '../model/current-week-query';
import {
  calendarDateBadge,
  calendarDateBadgeActive,
  calendarDateBadgeCompleted,
  calendarDateBadgeImage,
  calendarDateSlot,
  calendarDayItemWithStatus,
  calendarDayLabel,
  calendarAttendanceLabel,
  calendarAttendanceSlot,
  calendarWeek,
  locationText,
  sessionCard,
  sessionHeader,
  sessionTitle,
  teamPhotoActionLoading,
  teamPhotoIcon,
  teamPhotoMeta,
  teamPhotoStatus,
  teamPhotoText,
  teamPhotoThumbnail,
  teamPhotoThumbnailImage,
  teamPhotoTitle,
} from './home-page.css';

const ATTENDANCE_STATUS_LABEL = {
  AVAILABLE: '출석하기',
  NOT_ELIGIBLE: '출석 대상이 아니에요',
  CHECKED_IN: '출석했어요!',
  PENDING_APPROVAL: '인증 사진 검토 중',
} satisfies Record<
  Exclude<CurrentWeekSessionDetailResponse['attendanceStatus'], 'NOT_OPEN'>,
  string
>;

const teamPhotoStatusLabel = {
  PENDING: '운영진이 확인하고 있어요',
  APPROVED: '팀 인증이 완료됐어요',
  REJECTED: '팀 인증 사진이 반려됐어요',
} satisfies Record<UserTeamPhotoDetailResponse['status'], string>;

export function CurrentWeekCard() {
  const { phase } = useNativeAuthSession();
  const canQuery =
    staticContentEnabled() ||
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  return (
    <section className={sessionCard} aria-label="이번 주 세션">
      {canQuery ? (
        <LocalErrorBoundary fallbackRender={renderWeekError}>
          <Suspense fallback={<CurrentWeekLoading />}>
            <CurrentWeekContent />
          </Suspense>
        </LocalErrorBoundary>
      ) : (
        <output>세션은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.</output>
      )}
    </section>
  );
}

function CurrentWeekLoading() {
  return (
    <section aria-label="이번 주 세션을 불러오고 있어요" aria-busy="true">
      <VStack gap="x4" aria-hidden="true">
        <Skeleton className={skeletonPlaceholder} width="35%" height="lineHeight.t3" />
        <Skeleton className={skeletonPlaceholder} width="80%" height="lineHeight.t7" />
        <HStack justify="space-between" width="full">
          {Array.from({ length: 7 }, (_, day) => (
            <Skeleton className={skeletonPlaceholder} key={day} width="24px" height="48px" />
          ))}
        </HStack>
        <Skeleton className={skeletonPlaceholder} width="full" height="40px" radius="8" />
      </VStack>
    </section>
  );
}

function renderWeekError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="section"
      title="이번 주 세션을 불러오지 못했어요"
      titleAs="h2"
      onRetry={resetErrorBoundary}
    />
  );
}

function CurrentWeekContent() {
  const { apiOptions } = useNativeAuthSession();
  const active = useScreenActiveContext();
  const query = useSuspenseQuery({
    ...currentWeekQueryOptions(apiOptions),
    refetchOnMount: (cachedQuery) =>
      cachedQuery.state.data && nextKoreanMidnight(cachedQuery.state.data.weekEndDate) <= Date.now()
        ? 'always'
        : true,
    refetchOnWindowFocus: active ? 'always' : false,
  });
  useRefetchOnScreenReturn(query, 'always');
  useThrowQueryError(query);
  const { data, dataUpdatedAt } = query;
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
      <div className={sessionHeader}>
        <span className={locationText}>{session?.location ?? '이번 주 세션'}</span>
        <h2 className={sessionTitle}>
          {session ? `이번 주는 ${session.name} 세션이에요` : '이번 주 예정된 세션이 없어요'}
        </h2>
        {session && session.attendanceStatus !== 'NOT_OPEN' ? (
          <p>{formatKoreanTime(session.startTime)} 시작</p>
        ) : null}
      </div>
      <div className={calendarWeek} aria-label="주간 일정">
        {days.map(({ date, label }) => {
          const isCompleted = date === session?.date && session.attendanceStatus === 'CHECKED_IN';
          const dateLabel = isCompleted
            ? `${date} 출석 완료`
            : `${date}${date === session?.date ? ' 세션 예정' : ''}`;
          let badgeClassName = date === today ? calendarDateBadgeActive : calendarDateBadge;
          if (isCompleted) {
            badgeClassName = calendarDateBadgeCompleted;
          }
          return (
            <div key={date} className={calendarDayItemWithStatus}>
              <span className={calendarDayLabel}>{label}</span>
              <div className={calendarDateSlot}>
                <time
                  dateTime={date}
                  aria-current={date === today ? 'date' : undefined}
                  aria-label={dateLabel}
                  className={badgeClassName}
                >
                  {isCompleted ? (
                    <Image
                      src="/images/home/calendar-attendance-complete.svg"
                      alt=""
                      className={calendarDateBadgeImage}
                    />
                  ) : null}
                  <span aria-hidden={isCompleted || undefined}>{Number(date.slice(8))}</span>
                  {isCompleted ? <VisuallyHidden>{dateLabel}</VisuallyHidden> : null}
                </time>
              </div>
              <div className={calendarAttendanceSlot} aria-hidden="true">
                {isCompleted ? <span className={calendarAttendanceLabel}>출석</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      {session ? <SessionAttendanceAction session={session} now={dataUpdatedAt} /> : null}
    </>
  );
}

function getAttendanceLabel(session: CurrentWeekSessionDetailResponse, now: number) {
  if (session.attendanceStatus !== 'NOT_OPEN') {
    return ATTENDANCE_STATUS_LABEL[session.attendanceStatus];
  }
  if (now >= koreanTimestamp(session.endDate, session.endTime)) {
    return '출석이 마감됐어요';
  }
  const today = koreanDateString(now);
  if (session.date !== today) {
    return `${Number(session.date.slice(8))}일 ${session.startTime.slice(0, 5)}에 세션이 시작돼요`;
  }
  // 정기 세션은 시작 20분 전, 팀 세션은 시작 시간부터 안내하며 버튼 활성 여부는 attendanceStatus를 따른다.
  const opensAt =
    koreanTimestamp(session.date, session.startTime) -
    (session.type === 'REGULAR' ? 20 * 60_000 : 0);
  const openingDate = koreanDateString(opensAt);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(opensAt);
  const datePrefix = openingDate === today ? '' : `${Number(openingDate.slice(8))}일 `;
  return `${datePrefix}${time}에 출석할 수 있어요`;
}

function SessionAttendanceAction({
  session,
  now,
}: {
  session: CurrentWeekSessionDetailResponse;
  now: number;
}) {
  const { isNative } = useNativeAuthSession();
  const flow = useFlow();
  const attendanceLabel = getAttendanceLabel(session, now);
  const canOpenTeamPhoto =
    !staticContentEnabled() &&
    (isNative || (import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true'));
  if (session.type === 'REGULAR') {
    const disabled = session.attendanceStatus !== 'AVAILABLE';
    return (
      <ActionButton
        variant="neutralWeak"
        size="medium"
        disabled={disabled}
        onClick={() => flow.push('AttendanceCode', {})}
      >
        {attendanceLabel}
      </ActionButton>
    );
  }

  if (!canOpenTeamPhoto) {
    return (
      <TeamAttendanceAction disabled>인증 사진은 YAPP+ 앱에서 제출해 주세요</TeamAttendanceAction>
    );
  }
  if (session.attendanceStatus === 'AVAILABLE') {
    return (
      <TeamAttendanceAction
        onClick={() => flow.push('TeamAttendanceGuide', { sessionId: String(session.sessionId) })}
      >
        인증 사진 올리기
      </TeamAttendanceAction>
    );
  }
  if (session.attendanceStatus !== 'PENDING_APPROVAL') {
    return <TeamAttendanceAction disabled>{attendanceLabel}</TeamAttendanceAction>;
  }

  return (
    <LocalErrorBoundary
      resetKeys={[session.sessionId]}
      fallbackRender={renderTeamAttendancePhotoError}
    >
      <Suspense fallback={<TeamAttendancePhotoLoading />}>
        <TeamAttendancePhotoContent sessionId={session.sessionId} />
      </Suspense>
    </LocalErrorBoundary>
  );
}

function renderTeamAttendancePhotoError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="section"
      title="인증 사진 상태를 불러오지 못했어요"
      titleAs="h3"
      onRetry={resetErrorBoundary}
    />
  );
}

function TeamAttendancePhotoContent({ sessionId }: { sessionId: number }) {
  const { apiOptions } = useNativeAuthSession();
  const photoQuery = useSuspenseQuery(find1Options({ ...apiOptions, path: { sessionId } }));
  useThrowQueryError(photoQuery);

  if (photoQuery.data.photo === null) {
    return <TeamAttendanceAction disabled>인증 사진 검토 중</TeamAttendanceAction>;
  }

  return <TeamAttendancePhotoStatus photo={photoQuery.data.photo} />;
}

function TeamAttendanceAction({
  children,
  disabled = false,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <ActionButton variant="neutralWeak" size="medium" disabled={disabled} onClick={onClick}>
      {children}
    </ActionButton>
  );
}

function TeamAttendancePhotoLoading() {
  return (
    <section
      className={teamPhotoActionLoading}
      aria-label="인증 사진을 확인하고 있어요"
      aria-busy="true"
    >
      <Skeleton
        className={skeletonPlaceholder}
        width="full"
        height="57px"
        radius="8"
        aria-hidden="true"
      />
    </section>
  );
}

function TeamAttendancePhotoStatus({ photo }: { photo: UserTeamPhotoDetailResponse }) {
  const uploader = photo.uploader.name ?? '팀원';
  return (
    <output className={teamPhotoStatus}>
      <div className={teamPhotoText}>
        <div className={teamPhotoThumbnail}>
          {photo.imageUrl ? (
            <Image
              src={photo.imageUrl}
              alt=""
              width={41}
              height={41}
              className={teamPhotoThumbnailImage}
            />
          ) : (
            <IconCameraFill width={20} height={20} aria-hidden="true" />
          )}
        </div>
        <div>
          <p className={teamPhotoTitle}>{teamPhotoStatusLabel[photo.status]}</p>
          <p className={teamPhotoMeta}>
            {photo.uploadedTime} {uploader} 업로드 (참석 {photo.selectedMemberCount}명)
          </p>
        </div>
      </div>
      <IconCameraFill className={teamPhotoIcon} width={20} height={20} aria-hidden="true" />
    </output>
  );
}
