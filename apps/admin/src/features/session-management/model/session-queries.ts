import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import type { CreateSessionInput } from './session';
import {
  createSession,
  getAttendanceHistory,
  getAttendanceCode,
  getSessionAttendance,
  getTeamReviews,
  listSessions,
  listMemberScores,
  updateSession,
} from '../service';

export const sessionsQueryOptions = queryOptions({
  queryKey: ['admin', 'sessions'],
  queryFn: listSessions,
  retry: false,
});

export const memberScoresQueryOptions = queryOptions({
  queryKey: ['admin', 'attendance', 'member-scores'],
  queryFn: listMemberScores,
  retry: false,
});

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

export function useSessionsQuery() {
  const hydrated = useHydrated();

  return useQuery({
    ...sessionsQueryOptions,
    enabled: hydrated,
  });
}

export function useMemberScoresQuery() {
  const hydrated = useHydrated();

  return useQuery({
    ...memberScoresQueryOptions,
    enabled: hydrated,
  });
}

/** 생성 결과가 목록과 개수에 반영될 때까지 저장 완료를 기다립니다. */
export function useCreateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => client.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
  });
}

/** 수정 후에도 현재 필터를 유지하며 목록·정렬·개수를 다시 조회합니다. */
export function useUpdateSessionMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSessionInput }) =>
      updateSession(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: sessionsQueryOptions.queryKey }),
  });
}
