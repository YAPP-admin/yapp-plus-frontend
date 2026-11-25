import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, type ReactNode } from 'react';
import { HttpResponse, http } from 'msw';
import { expect, it } from 'vitest';
import { createAdminQueryClient } from '~/query-client';
import { apiBaseUrl, server } from '~/mocks/server';
import {
  attendanceCodeApiQueryOptions,
  teamReviewsApiQueryOptions,
  useSessionAttendanceQuery,
} from './session-queries';

const attendanceResponse = {
  items: [
    {
      membershipId: 1001,
      userName: '테스트 회원',
      position: 'IOS',
      latestReportType: null,
      latestReportReason: null,
      checkedInAt: '2026-10-31T05:00:00Z',
      earlyLeaveAt: '2026-10-31T07:00:00Z',
      status: 'EARLY_LEAVE',
      scoreDelta: -4,
      badgeVerified: true,
      badgeVerifiedAt: '2026-10-31T05:05:00Z',
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
  });
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
