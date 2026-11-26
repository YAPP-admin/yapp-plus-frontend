/** 생성 Query를 순차 조합해 홈 한 진입의 첫 미표시 결과를 찾습니다. UI와 기록 시점은 소유하지 않습니다. */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  find1Options,
  find6Options,
  find7Options,
  find8InfiniteOptions,
  zAttendanceHistoryItemResponse,
  zAttendanceHistoryResponse,
  zCurrentGenerationSessionItemResponse,
  zCurrentGenerationSessionsResponse,
  zCurrentWeekSessionDetailResponse,
  zCurrentWeekSessionResponse,
  zUserTeamPhotoDetailResponse,
  zUserTeamPhotoResponse,
} from '@yapp-plus/api/generated';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';
import { type TeamAttendanceResult, toTeamAttendanceResult } from './team-attendance-result';
import type { TeamAttendanceResultStorage } from './team-attendance-result-storage';

// 생성 int64 스키마의 bigint 변환 결과는 사용하지 않고, 실제 소비하는 ID는 안전한 number만 허용합니다.
const ID = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const TIME = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/);
const SESSION_SCHEMA = zCurrentGenerationSessionItemResponse.extend({
  sessionId: ID,
  startTime: TIME,
  endTime: TIME,
});
const SCHEDULE_SCHEMA = zCurrentGenerationSessionsResponse.extend({
  generationId: ID,
  sessions: SESSION_SCHEMA.array(),
});
const WEEK_SCHEMA = zCurrentWeekSessionResponse.extend({
  session: zCurrentWeekSessionDetailResponse.extend({ sessionId: ID }).nullable(),
});
const HISTORY_SCHEMA = zAttendanceHistoryResponse.extend({
  items: zAttendanceHistoryItemResponse.extend({ sessionId: ID }).array(),
  nextCursor: z.string().min(1).nullable(),
});
const PHOTO_SCHEMA = zUserTeamPhotoResponse.extend({
  photo: zUserTeamPhotoDetailResponse.extend({ photoId: ID }).nullable(),
});

/** 계정·홈 진입별로 새로 마운트합니다. enabled=false이면 늦은 응답도 반환하지 않습니다. */
export function useTeamAttendanceResult({
  userId,
  enabled,
  storage,
  apiOptions,
  now,
}: {
  userId: number;
  enabled: boolean;
  storage: TeamAttendanceResultStorage;
  apiOptions?: Parameters<typeof find7Options>[0];
  now: number;
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<Pick<
    TeamAttendanceResult,
    'sessionId' | 'photoId' | 'kind'
  > | null>(null);
  const fresh = { enabled: enabled && !shown, staleTime: 0, refetchOnMount: 'always' as const };
  const schedule = useQuery({
    ...find7Options({
      ...apiOptions,
      responseValidator: (value) => SCHEDULE_SCHEMA.parseAsync(value),
    }),
    ...fresh,
  });
  const week = useQuery({
    ...find6Options({ ...apiOptions, responseValidator: (value) => WEEK_SCHEMA.parseAsync(value) }),
    ...fresh,
  });
  const history = useInfiniteQuery({
    ...find8InfiniteOptions({
      ...apiOptions,
      responseValidator: (value) => HISTORY_SCHEMA.parseAsync(value),
    }),
    ...fresh,
    initialPageParam: {},
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const ready =
    enabled &&
    schedule.isFetchedAfterMount &&
    week.isFetchedAfterMount &&
    history.isFetchedAfterMount &&
    !schedule.isFetching &&
    !week.isFetching &&
    !history.isFetching &&
    !schedule.isError &&
    !week.isError &&
    !history.isError;
  const sessions = (schedule.data?.sessions ?? [])
    .filter(
      (session) =>
        session.type === 'TEAM' && koreanTimestamp(session.date, session.startTime) <= now,
    )
    // ES2022 타깃에서는 toSorted를 사용할 수 없어 filter로 만든 복사본만 정렬합니다.
    // oxlint-disable-next-line unicorn/no-array-sort
    .sort(
      (a, b) =>
        koreanTimestamp(b.date, b.startTime) - koreanTimestamp(a.date, a.startTime) ||
        b.sessionId - a.sessionId,
    );
  const priority = sessions.find(
    (session) =>
      session.sessionId === week.data?.session?.sessionId &&
      week.data?.session?.attendanceStatus === 'AVAILABLE',
  );
  const items = history.data?.pages.flatMap((page) => page.items) ?? [];
  const candidates = (priority ? [priority, ...sessions] : sessions).map((session, position) => {
    const attendance = items.find((item) => item.sessionId === session.sessionId);
    const priorityOnly = priority !== undefined && position === 0;
    const rejected =
      attendance?.attendanceStatus === 'UNDECIDED' && attendance.staffDecisionStatus === 'REJECTED';
    const eligible =
      attendance !== undefined &&
      (priorityOnly
        ? rejected
        : rejected || !['UNDECIDED', 'EXCUSED_ABSENCE'].includes(attendance.attendanceStatus));
    return { session, attendance, priorityOnly, eligible };
  });
  // 사진이 필요 없는 후보는 한 번에 건너뛰어 긴 빈 목록에서도 렌더 반복을 만들지 않습니다.
  const candidateIndex = candidates.findIndex(
    (candidate, position) =>
      position >= index && (candidate.eligible || (!candidate.attendance && history.hasNextPage)),
  );
  const { session, attendance, priorityOnly, eligible } = candidates[candidateIndex] ?? {};
  const photo = useQuery({
    ...find1Options({
      ...apiOptions,
      path: { sessionId: session?.sessionId ?? 0 },
      responseValidator: (value) => PHOTO_SCHEMA.parseAsync(value),
    }),
    ...fresh,
    enabled: !shown && ready && eligible === true,
  });
  const photoReady = photo.isFetchedAfterMount && !photo.isFetching && !photo.isError;
  const result =
    ready && eligible && photoReady && session && attendance && photo.data && week.data
      ? toTeamAttendanceResult(session, attendance, photo.data, week.data, now)
      : null;
  const scope = { userId, generationId: schedule.data?.generationId ?? 0 };
  const unseen =
    result &&
    (!priorityOnly || (result.kind === 'REJECTED' && result.reupload === 'AVAILABLE')) &&
    (shown
      ? shown.sessionId === result.sessionId &&
        shown.photoId === result.photoId &&
        shown.kind === result.kind
      : !storage.hasShown(scope, result))
      ? result
      : null;
  const skip = !shown && ready && eligible && photoReady && !unseen;
  if (skip) {
    setIndex(candidateIndex + 1);
  }
  const { hasNextPage, fetchNextPage } = history;
  useEffect(() => {
    if (!shown && ready && session && !attendance && hasNextPage) {
      void fetchNextPage();
    }
  }, [shown, ready, session, attendance, hasNextPage, fetchNextPage]);
  return {
    result: unseen,
    currentSessionId: week.data?.session?.sessionId,
    /** 실제 표시 callback에서만 기록하며 한 진입의 후보를 고정합니다. */
    markShown: () => {
      if (!enabled || !unseen || shown || !schedule.data) {
        return;
      }
      storage.markShown(scope, unseen);
      setShown({ sessionId: unseen.sessionId, photoId: unseen.photoId, kind: unseen.kind });
    },
    isComplete: ready && session === undefined,
    generationId: schedule.data?.generationId,
    error: schedule.error ?? week.error ?? history.error ?? photo.error,
  };
}
