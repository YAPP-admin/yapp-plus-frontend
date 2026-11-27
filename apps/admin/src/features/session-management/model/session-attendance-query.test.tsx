import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, type ReactNode } from 'react';
import { HttpResponse, http } from 'msw';
import { expect, it } from 'vitest';
import { createAdminQueryClient } from '~/query-client';
import { apiBaseUrl, server } from '~/mocks/server';
import {
  attendanceBadgeMutationOptions,
  attendanceCodeIssueMutationOptions,
  attendanceCodeReissueMutationOptions,
  attendanceCloseCancelMutationOptions,
  attendanceCloseMutationOptions,
  attendanceOverrideMutationOptions,
  attendanceCodeApiQueryOptions,
  memberScoreDetailQueryOptions,
  teamReviewDecisionMutationOptions,
  toAttendanceOverrideRequest,
  teamReviewsApiQueryOptions,
  useSessionAttendanceQuery,
} from './session-queries';

const attendanceResponse = {
  items: [
    {
      membershipId: 1001,
      userName: '테스트 회원',
      position: 'IOS',
      latestReportType: 'LATE',
      latestReportReason: '운영진 확인 필요',
      checkedInAt: '2026-10-31T05:00:00Z',
      earlyLeaveAt: '2026-10-31T07:00:00Z',
      status: 'EARLY_LEAVE',
      scoreDelta: -4,
      badgeVerified: true,
      badgeVerifiedAt: '2026-10-31T05:05:00Z',
      selectedStatuses: ['EARLY_LEAVE_ONE_HOUR'],
      effectiveStatus: 'EARLY_LEAVE',
      correctedAt: '2026-10-31T08:00:00Z',
      latestReportTypes: ['LATE'],
      latestReportSubmittedAt: '2026-10-31T04:30:00Z',
    },
  ],
  nextCursor: null,
} as const;

function createWrapper() {
  const client = createAdminQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <Suspense fallback={<output>불러오는 중</output>}>{children}</Suspense>
      </QueryClientProvider>
    );
  };
}

it('생성 SDK 출석 명단을 실제 체크인·조퇴 시각이 포함된 회원 모델로 변환한다', async () => {
  server.use(
    http.get(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance`,
      () => HttpResponse.json(attendanceResponse),
    ),
  );

  const { result } = renderHook(() => useSessionAttendanceQuery(33, '101'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.members).toHaveLength(1));

  expect(result.current.members[0]).toMatchObject({
    membershipId: '1001',
    name: '테스트 회원',
    part: 'ios',
    attendance: {
      status: 'earlyLeave',
      checkedInAt: '2026-10-31T05:00:00Z',
      earlyLeaveAt: '2026-10-31T07:00:00Z',
    },
    badge: { verified: true, verifiedAt: '2026-10-31T05:05:00Z' },
    score: { source: 'server', delta: -4 },
    latestReport: {
      type: 'late',
      reason: '운영진 확인 필요',
      submittedAt: '2026-10-31T04:30:00Z',
    },
    selectedStatuses: ['EARLY_LEAVE_ONE_HOUR'],
    effectiveStatus: 'EARLY_LEAVE',
    correctedAt: '2026-10-31T08:00:00Z',
  });
});

it.each([
  ['EARLY_LEAVE_ONE_HOUR', 'withinOneHour'],
  ['EARLY_LEAVE_THREE_HOUR', 'withinThreeHours'],
] as const)('새 조퇴 상태 %s를 시간 구간으로 보존한다', async (status, durationBand) => {
  server.use(
    http.get(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance`,
      () =>
        HttpResponse.json({
          ...attendanceResponse,
          items: [{ ...attendanceResponse.items[0], status }],
        }),
    ),
  );

  const { result } = renderHook(() => useSessionAttendanceQuery(33, '101'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.members).toHaveLength(1));

  expect(result.current.members[0]?.attendance).toMatchObject({
    status: 'earlyLeave',
    durationBand,
  });
});

it.each([
  ['withinOneHour', 'EARLY_LEAVE_ONE_HOUR'],
  ['withinThreeHours', 'EARLY_LEAVE_THREE_HOUR'],
] as const)('조퇴 시간 구간 %s를 서버 상태 %s로 전송한다', (durationBand, status) => {
  expect(
    toAttendanceOverrideRequest({
      membershipId: '1001',
      status: 'earlyLeave',
      penaltyCategory: 'regular',
      durationBand,
      reason: '운영진 판정',
    }),
  ).toEqual({ statuses: [status], reason: '운영진 판정' });
});

it('생성 SDK 출석 코드와 팀 사진 검수 응답을 화면 모델로 변환한다', async () => {
  server.use(
    http.get(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance-code`,
      () =>
        HttpResponse.json({
          status: 'ISSUED',
          code: 123456,
          revision: 1,
          issuedAt: '2026-10-31T05:00:00Z',
          issuedByStaffId: 1,
        }),
    ),
    http.get(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/team-attendance-photos`,
      () =>
        HttpResponse.json({
          items: [
            {
              photoId: 1,
              teamId: 2,
              teamName: '테스트 팀',
              uploaderId: 3,
              uploaderName: '업로더',
              submittedAt: '2026-10-31T05:00:00Z',
              status: 'PENDING',
              readUrl: 'https://example.com/team-photo.jpg',
              members: [
                {
                  membershipId: 1001,
                  userName: '테스트 회원',
                  selected: true,
                  provisionalStatus: 'PRESENT',
                  priorReports: [],
                },
              ],
            },
          ],
        }),
    ),
  );

  const client = createAdminQueryClient();
  const code = await client.fetchQuery(attendanceCodeApiQueryOptions(33, '101'));
  const reviews = await client.fetchQuery(teamReviewsApiQueryOptions(33, '101'));

  expect(code).toEqual({ state: 'active', code: '123456', expiresAt: null });
  expect(reviews[0]).toMatchObject({
    teamId: '2',
    teamName: '테스트 팀',
    reviewState: 'pending',
    photo: {
      access: 'available',
      selectedMembershipIds: ['1001'],
      readUrl: 'https://example.com/team-photo.jpg',
    },
  });
});

it('출결 변경 mutation이 생성 SDK 계약에 맞는 요청을 보낸다', async () => {
  let overrideBody: unknown;
  let badgeBody: unknown;
  let closeRequestCount = 0;
  let cancelRequestCount = 0;

  server.use(
    http.patch(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance/:membershipId`,
      async ({ request }) => {
        overrideBody = await request.json();
        return HttpResponse.json({});
      },
    ),
    http.patch(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance/:membershipId/badge`,
      async ({ request }) => {
        badgeBody = await request.json();
        return HttpResponse.json({});
      },
    ),
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance/close`,
      () => {
        closeRequestCount += 1;
        return HttpResponse.json({});
      },
    ),
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance/close/cancel`,
      () => {
        cancelRequestCount += 1;
        return HttpResponse.json({});
      },
    ),
  );

  const client = createAdminQueryClient();
  await client
    .getMutationCache()
    .build(client, attendanceOverrideMutationOptions(33, '101'))
    .execute({
      membershipId: '1001',
      status: 'late',
      penaltyCategory: 'regular',
      durationBand: 'withinThreeHours',
      reason: '운영진 판정',
    });
  await client
    .getMutationCache()
    .build(client, attendanceBadgeMutationOptions(33, '101'))
    .execute({ membershipId: '1001', verified: true });
  await client
    .getMutationCache()
    .build(client, attendanceCloseMutationOptions(33, '101'))
    .execute(undefined);
  await client
    .getMutationCache()
    .build(client, attendanceCloseCancelMutationOptions(33, '101'))
    .execute(undefined);

  expect(overrideBody).toEqual({
    statuses: ['LATE_THREE_HOUR'],
    reason: '운영진 판정',
  });
  expect(badgeBody).toEqual({ enabled: true });
  expect(closeRequestCount).toBe(1);
  expect(cancelRequestCount).toBe(1);
});

it('출석 코드와 팀 사진 검수 mutation이 생성 SDK 계약에 맞는 요청을 보낸다', async () => {
  let issueRequestCount = 0;
  let reissueRequestCount = 0;
  let decisionBody: unknown;

  server.use(
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance-code`,
      () => {
        issueRequestCount += 1;
        return HttpResponse.json({
          status: 'ISSUED',
          code: 123456,
          revision: 1,
          issuedAt: '2026-10-31T05:00:00Z',
          issuedByStaffId: 1,
        });
      },
    ),
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance-code/reissue`,
      () => {
        reissueRequestCount += 1;
        return HttpResponse.json({
          status: 'ISSUED',
          code: 654321,
          revision: 2,
          issuedAt: '2026-10-31T06:00:00Z',
          issuedByStaffId: 1,
        });
      },
    ),
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/team-attendance-photos/:photoId/decision`,
      async ({ request }) => {
        decisionBody = await request.json();
        return HttpResponse.json({
          photoId: 7,
          status: 'REJECTED',
          decidedAt: '2026-10-31T06:05:00Z',
        });
      },
    ),
  );

  const client = createAdminQueryClient();
  const issuedCode = await client
    .getMutationCache()
    .build(client, attendanceCodeIssueMutationOptions(33, '101'))
    .execute(undefined);
  const reissuedCode = await client
    .getMutationCache()
    .build(client, attendanceCodeReissueMutationOptions(33, '101'))
    .execute(undefined);
  await client
    .getMutationCache()
    .build(client, teamReviewDecisionMutationOptions(33, '101'))
    .execute({ photoId: '7', decision: 'reject', reason: '사진이 기준과 다릅니다.' });

  expect(issuedCode).toEqual({ state: 'active', code: '123456', expiresAt: null });
  expect(reissuedCode).toEqual({ state: 'active', code: '654321', expiresAt: null });
  expect(issueRequestCount).toBe(1);
  expect(reissueRequestCount).toBe(1);
  expect(decisionBody).toEqual({ decision: 'REJECTED', reason: '사진이 기준과 다릅니다.' });
});

it('회원별 출석 점수 상세 API 응답을 점수 근거 모델로 변환한다', async () => {
  server.use(
    http.get(
      `${apiBaseUrl}/api/admin/generations/:generationId/memberships/:membershipId/attendance-statistics`,
      () =>
        HttpResponse.json({
          membershipId: 1001,
          name: '테스트 회원',
          generationNumber: 12,
          position: 'IOS',
          totalScore: 88,
          deductions: [
            {
              sessionId: 101,
              sessionName: '1회차 정규 세션',
              status: 'LATE',
              delta: -4,
              checkedInAt: '2026-10-31T05:00:00Z',
              earlyLeaveAt: null,
            },
            {
              sessionId: 102,
              sessionName: '2회차 팀 세션',
              status: 'ABSENT',
              delta: -8,
              checkedInAt: null,
              earlyLeaveAt: null,
            },
          ],
        }),
    ),
  );

  const { result } = renderHook(() => useSuspenseQuery(memberScoreDetailQueryOptions(33, '1001')), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.data.attendanceEntries).toHaveLength(2));
  const detail = result.current.data;

  expect(detail).toEqual({
    totalScore: 88,
    adjustmentEntries: [],
    attendanceEntries: [
      {
        sessionId: '101',
        title: '1회차 정규 세션',
        score: {
          source: 'server',
          delta: -4,
          description: '서버 확정 지각 감점',
        },
      },
      {
        sessionId: '102',
        title: '2회차 팀 세션',
        score: {
          source: 'server',
          delta: -8,
          description: '서버 확정 결석 감점',
        },
      },
    ],
  });
});
