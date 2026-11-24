import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { ApiError } from '@yapp-plus/api';
import {
  get,
  find2Options,
  list4InfiniteOptions,
  list3,
  list7Options,
  badge,
  cancel1,
  close,
  override,
  type AdminAttendanceListResponse,
  type AttendanceCodeResponse,
  type OverrideAttendanceRequest,
  type TeamPhotoWithUrl,
} from '@yapp-plus/api/generated';
import { useEffect } from 'react';
import type { CreateSessionInput } from './session';
import { attendanceResultSchema } from './attendance';
import type { AttendanceEditInput, BadgeEditInput } from './attendance-input';
import type {
  AttendanceCodeViewModel,
  AttendanceMemberViewModel,
  TeamReviewViewModel,
} from './attendance-view-model';
import {
  createSession,
  getAttendanceHistory,
  getAttendanceCode,
  getTeamReviews,
  updateSession,
} from '../service';

export const sessionsQueryOptions = (generationId: number) => {
  const options = find2Options({
    path: { generationId },
    query: { type: 'ALL' },
  });
  return queryOptions({
    ...options,
    retry: false,
    select: (response) =>
      response.sessions.map((session) => ({
        id: String(session.sessionId),
        name: session.name,
        type: session.type === 'TEAM' ? 'team' : 'regular',
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        phase:
          session.attendanceSummary.status === 'STARTED' ? ('open' as const) : ('unknown' as const),
        attendance: {
          present: session.attendanceSummary.presentCount,
          pending: session.attendanceSummary.undecidedCount,
        },
      })),
  });
};

export const memberScoresQueryOptions = (generationId: number) => {
  const options = list7Options({ path: { generationId } });
  return queryOptions({
    ...options,
    retry: false,
    select: (response) =>
      response.items.map((item) => ({
        membershipId: String(item.membershipId),
        name: item.name,
        part: item.position?.toLowerCase() ?? null,
        initialScore: 100 as const,
        attendanceEntries: [],
        adjustmentEntries: [],
        totalScore: item.totalScore,
        warning: item.totalScore !== null && item.totalScore < 40,
      })),
  });
};

const reportTypeByApiValue = {
  LATE: 'late',
  EARLY_LEAVE: 'earlyLeave',
  ABSENCE: 'absence',
  ABSENT: 'absence',
} as const;

function toReportType(value: string | null) {
  return value
    ? (reportTypeByApiValue[value.toUpperCase() as keyof typeof reportTypeByApiValue] ?? null)
    : null;
}

function toAttendanceResult(row: AdminAttendanceListResponse['items'][number]) {
  const common = {
    checkedInAt: row.checkedInAt,
    earlyLeaveAt: row.earlyLeaveAt,
    reason: null,
    explicitlyOverridden: false,
  } as const;

  switch (row.status) {
    case 'UNDECIDED':
      return attendanceResultSchema.parse({
        ...common,
        status: 'undecided',
        penaltyCategory: null,
        durationBand: null,
      });
    case 'PRESENT':
      return attendanceResultSchema.parse({
        ...common,
        status: 'present',
        penaltyCategory: null,
        durationBand: null,
      });
    case 'LATE_ONE_HOUR':
      return attendanceResultSchema.parse({
        ...common,
        status: 'late',
        penaltyCategory: 'unknown',
        durationBand: 'withinOneHour',
      });
    case 'LATE_THREE_HOUR':
      return attendanceResultSchema.parse({
        ...common,
        status: 'late',
        penaltyCategory: 'unknown',
        durationBand: 'withinThreeHours',
      });
    case 'EARLY_LEAVE':
      return attendanceResultSchema.parse({
        ...common,
        status: 'earlyLeave',
        penaltyCategory: 'unknown',
        durationBand: null,
      });
    case 'ABSENT':
      return attendanceResultSchema.parse({
        ...common,
        status: 'absent',
        penaltyCategory: 'unknown',
        durationBand: null,
      });
    case 'EXCUSED_ABSENCE':
      return attendanceResultSchema.parse({
        ...common,
        status: 'unsupported',
        penaltyCategory: 'unknown',
        durationBand: null,
      });
    default:
      throw new Error(`지원하지 않는 출석 상태입니다: ${String(row.status)}`);
  }
}

function toMemberViewModel(
  row: AdminAttendanceListResponse['items'][number],
): AttendanceMemberViewModel {
  const reportType = toReportType(row.latestReportType);
  return {
    membershipId: String(row.membershipId),
    name: row.userName,
    part: row.position?.toLowerCase() ?? null,
    teamId: null,
    attendance: toAttendanceResult(row),
    latestReport:
      reportType === null
        ? null
        : {
            id: `attendance-report-${row.membershipId}`,
            membershipId: String(row.membershipId),
            type: reportType,
            reason: row.latestReportReason ?? '사유 없음',
            submittedAt: null,
            eligibility: 'unknown',
          },
    badge: {
      verified: row.badgeVerified,
      verifiedAt: row.badgeVerifiedAt,
    },
    score:
      row.scoreDelta === null
        ? { source: 'unknown', delta: null, description: '서버 점수 확인 필요' }
        : { source: 'server', delta: row.scoreDelta, description: '서버 출결 점수' },
    isEditable: row.status !== 'EXCUSED_ABSENCE',
  };
}

export const sessionAttendanceQueryOptions = (generationId: number, sessionId: string) => {
  const path = { generationId, sessionId: Number(sessionId) };
  const generated = list4InfiniteOptions({ path, query: { size: 100 } });
  return {
    ...generated,
    // 생성 타입에는 skipToken도 포함되지만 Suspense는 함수 queryFn만 허용합니다.
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    retry: false,
    initialPageParam: { path, query: { size: 100 } },
    getNextPageParam: (lastPage: AdminAttendanceListResponse) => lastPage.nextCursor ?? undefined,
  };
};

function toNumberId(id: string, label: string) {
  const value = Number(id);
  if (!Number.isInteger(value)) {
    throw new Error(`${label}는 숫자 식별자여야 합니다.`);
  }
  return value;
}

export function toAttendanceOverrideRequest(input: AttendanceEditInput): OverrideAttendanceRequest {
  let status: OverrideAttendanceRequest['status'];
  switch (input.status) {
    case 'late':
      status = input.durationBand === 'withinThreeHours' ? 'LATE_THREE_HOUR' : 'LATE_ONE_HOUR';
      break;
    case 'earlyLeave':
      status = 'EARLY_LEAVE';
      break;
    case 'absent':
      status = 'ABSENT';
      break;
    case 'present':
      status = 'PRESENT';
      break;
    case 'undecided':
      status = 'UNDECIDED';
      break;
  }

  return { status, reason: input.reason };
}

export const attendanceOverrideMutationOptions = (generationId: number, sessionId: string) =>
  mutationOptions({
    mutationFn: async (input: AttendanceEditInput) => {
      await override({
        path: {
          generationId,
          sessionId: toNumberId(sessionId, '세션 ID'),
          membershipId: toNumberId(input.membershipId, '회원 ID'),
        },
        body: toAttendanceOverrideRequest(input),
        throwOnError: true,
      });
    },
  });

export const attendanceBadgeMutationOptions = (generationId: number, sessionId: string) =>
  mutationOptions({
    mutationFn: async (input: BadgeEditInput) => {
      await badge({
        path: {
          generationId,
          sessionId: toNumberId(sessionId, '세션 ID'),
          membershipId: toNumberId(input.membershipId, '회원 ID'),
        },
        body: { enabled: input.verified },
        throwOnError: true,
      });
    },
  });

export const attendanceCloseMutationOptions = (generationId: number, sessionId: string) =>
  mutationOptions({
    mutationFn: async () => {
      await close({
        path: { generationId, sessionId: toNumberId(sessionId, '세션 ID') },
        throwOnError: true,
      });
    },
  });

export const attendanceCloseCancelMutationOptions = (generationId: number, sessionId: string) =>
  mutationOptions({
    mutationFn: async () => {
      await cancel1({
        path: { generationId, sessionId: toNumberId(sessionId, '세션 ID') },
        throwOnError: true,
      });
    },
  });

export function useSessionAttendanceQuery(generationId: number, sessionId: string) {
  const query = useSuspenseInfiniteQuery(sessionAttendanceQueryOptions(generationId, sessionId));

  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

  return {
    ...query,
    members: query.data.pages.flatMap((page) => page.items.map(toMemberViewModel)),
  };
}

function toAttendanceCodeViewModel(response: AttendanceCodeResponse): AttendanceCodeViewModel {
  if (response.status === 'NOT_ISSUED' || response.code === null) {
    return { state: 'notIssued', code: null, expiresAt: null };
  }
  return { state: 'active', code: String(response.code), expiresAt: null };
}

export const attendanceCodeApiQueryOptions = (generationId: number, sessionId: string) => {
  const path = { generationId, sessionId: Number(sessionId) };
  return queryOptions({
    queryKey: [
      'admin',
      'generations',
      String(generationId),
      'sessions',
      sessionId,
      'attendance-code',
    ],
    retry: false,
    queryFn: async ({ signal }) => {
      try {
        const response = await get({ path, signal, throwOnError: true });
        return toAttendanceCodeViewModel(response.data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return { state: 'notIssued' as const, code: null, expiresAt: null };
        }
        throw error;
      }
    },
  });
};

function toTeamMemberViewModel(teamId: number, membershipId: number, name: string | null) {
  return {
    membershipId: String(membershipId),
    name: name ?? '회원 정보 없음',
    part: null,
    teamId: String(teamId),
    attendance: attendanceResultSchema.parse({
      status: 'unsupported',
      checkedInAt: null,
      earlyLeaveAt: null,
      reason: null,
      explicitlyOverridden: false,
      penaltyCategory: 'unknown',
      durationBand: null,
    }),
    latestReport: null,
    badge: { verified: false, verifiedAt: null },
    score: { source: 'unknown' as const, delta: null, description: '점수 확인 필요' },
    isEditable: false,
  } satisfies AttendanceMemberViewModel;
}

function toTeamReviewViewModel(photo: TeamPhotoWithUrl): TeamReviewViewModel {
  const status = photo.status.toUpperCase();
  let reviewState: TeamReviewViewModel['reviewState'];
  if (status === 'PENDING' || status === 'SUBMITTED') {
    reviewState = 'pending';
  } else if (status === 'APPROVED') {
    reviewState = 'approved';
  } else if (status === 'REJECTED') {
    reviewState = 'rejected';
  } else {
    reviewState = 'unknown';
  }
  const members = photo.members.map((member) =>
    toTeamMemberViewModel(photo.teamId, member.membershipId, member.userName),
  );
  const selectedMembershipIds = photo.members
    .filter((member) => member.selected)
    .map((member) => String(member.membershipId));
  const teamPhoto = photo.readUrl
    ? {
        access: 'available' as const,
        photoId: String(photo.photoId),
        uploaderName: photo.uploaderName,
        submittedAt: photo.submittedAt,
        selectedMembershipIds,
        readUrl: photo.readUrl,
      }
    : {
        access: 'unavailable' as const,
        photoId: String(photo.photoId),
        uploaderName: photo.uploaderName,
        submittedAt: photo.submittedAt,
        selectedMembershipIds,
        readUrl: null,
      };
  return {
    teamId: String(photo.teamId),
    teamName: photo.teamName,
    members,
    reviewState,
    photo: teamPhoto,
    decisionDraft: null,
  };
}

export const teamReviewsApiQueryOptions = (generationId: number, sessionId: string) => {
  const path = { generationId, sessionId: Number(sessionId) };
  return queryOptions({
    queryKey: ['admin', 'generations', String(generationId), 'sessions', sessionId, 'team-reviews'],
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await list3({ path, signal, throwOnError: true });
      return response.data.items.map(toTeamReviewViewModel);
    },
  });
};

export const attendanceHistoryQueryOptions = (sessionId: string, membershipId: string) =>
  queryOptions({
    queryKey: ['admin', 'sessions', sessionId, 'attendance-history', membershipId],
    queryFn: () => getAttendanceHistory(sessionId, membershipId),
    retry: false,
  });

export const teamReviewsQueryOptions = (sessionId: string) =>
  queryOptions({
    queryKey: ['admin', 'sessions', sessionId, 'team-reviews'],
    queryFn: () => getTeamReviews(sessionId),
    retry: false,
  });

export const attendanceCodeQueryOptions = (sessionId: string) =>
  queryOptions({
    queryKey: ['admin', 'sessions', sessionId, 'attendance-code'],
    queryFn: () => getAttendanceCode(sessionId),
    retry: false,
  });

export function useSessionsQuery(generationId: number) {
  return useSuspenseQuery(sessionsQueryOptions(generationId));
}

export function useMemberScoresQuery(generationId: number) {
  return useSuspenseQuery(memberScoresQueryOptions(generationId));
}

/** 생성 결과가 목록과 개수에 반영될 때까지 저장 완료를 기다립니다. */
export function useCreateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'generations'] }),
  });
}

/** 수정 후에도 현재 필터를 유지하며 목록·정렬·개수를 다시 조회합니다. */
export function useUpdateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSessionInput }) =>
      updateSession(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'generations'] }),
  });
}
