import { staticContentEnabled } from '@/features/static-content';
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  find1Options,
  type CurrentWeekSessionDetailResponse,
  type UserTeamPhotoDetailResponse,
} from '@yapp-plus/api/generated';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { HStack, Skeleton, VStack, VisuallyHidden } from '@seed-design/react';
import { Suspense } from 'react';
import { useFlow } from '@stackflow/react';
import { IconCameraFill } from '@karrotmarket/react-monochrome-icon';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Image } from '@/app/navigation/image';
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
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
  calendarDateToday,
  calendarDayItem,
  calendarDayLabel,
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

const attendanceStatusLabel = {
  AVAILABLE: '출석하기',
  NOT_ELIGIBLE: '출석 대상이 아니에요',
  NOT_OPEN: '아직 출석할 수 없어요',
  CHECKED_IN: '출석했어요!',
  PENDING_APPROVAL: '인증 사진 검토 중',
} satisfies Record<CurrentWeekSessionDetailResponse['attendanceStatus'], string>;

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
        <ScreenQueryBoundary renderFallback={() => <WeekError />}>
          <Suspense fallback={<CurrentWeekLoading />}>
            <CurrentWeekContent />
          </Suspense>
        </ScreenQueryBoundary>
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

function WeekError() {
  const { resetBoundary } = useErrorBoundary();
  return (
    <ResultSection
      role="alert"
      size="medium"
      title="이번 주 세션을 불러오지 못했어요"
      primaryActionProps={{ children: '다시 시도', onClick: resetBoundary }}
    />
  );
}

function CurrentWeekContent() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery({
    ...currentWeekQueryOptions(apiOptions),
    refetchOnMount: (cachedQuery) =>
      cachedQuery.state.data && nextKoreanMidnight(cachedQuery.state.data.weekEndDate) <= Date.now()
        ? 'always'
        : true,
    refetchOnWindowFocus: (cachedQuery) =>
      cachedQuery.state.data && nextKoreanMidnight(cachedQuery.state.data.weekEndDate) <= Date.now()
        ? 'always'
        : true,
  });
  useRefetchOnScreenReturn(query);
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
      {session ? <SessionAttendanceAction session={session} /> : null}
    </>
  );
}

function SessionAttendanceAction({ session }: { session: CurrentWeekSessionDetailResponse }) {
  const { isNative } = useNativeAuthSession();
  const flow = useFlow();
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
        {attendanceStatusLabel[session.attendanceStatus]}
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
    return (
      <TeamAttendanceAction disabled>
        {attendanceStatusLabel[session.attendanceStatus]}
      </TeamAttendanceAction>
    );
  }

  return (
    <ErrorBoundary
      resetKeys={[session.sessionId]}
      fallback={<TeamAttendanceAction disabled>인증 사진 검토 중</TeamAttendanceAction>}
    >
      <Suspense fallback={<TeamAttendancePhotoLoading />}>
        <TeamAttendancePhotoContent sessionId={session.sessionId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function TeamAttendancePhotoContent({ sessionId }: { sessionId: number }) {
  const { apiOptions } = useNativeAuthSession();
  const photoQuery = useSuspenseQuery(find1Options({ ...apiOptions, path: { sessionId } }));

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
    <div className={teamPhotoActionLoading}>
      <VisuallyHidden asChild>
        <output>인증 사진을 확인하고 있어요…</output>
      </VisuallyHidden>
      <Skeleton width="full" height="57px" radius="8" aria-hidden="true" />
    </div>
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
