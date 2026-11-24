import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { find2Options, list7Options } from '@yapp-plus/api/generated';
import type { CreateSessionInput } from './session';
import {
  createSession,
  getAttendanceHistory,
  getAttendanceCode,
  getSessionAttendance,
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

export const sessionAttendanceQueryOptions = (sessionId: string) =>
  queryOptions({
    queryKey: ['admin', 'sessions', sessionId, 'attendance'],
    queryFn: () => getSessionAttendance(sessionId),
    retry: false,
  });

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
