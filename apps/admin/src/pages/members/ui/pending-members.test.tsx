/** 가입 심사 목록 조회와 승인·반려 완료 흐름을 생성 API 계약으로 검증합니다. */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type {
  MemberDetailResponse,
  PendingMemberListResponse,
  RosterCandidateView,
} from '@yapp-plus/api/generated';
import { HttpResponse, http } from 'msw';
import { beforeEach, expect, it } from 'vitest';
import { AdminOverlayProvider } from '../../../app/ui/admin-overlay-provider';
import { createAdminQueryClient } from '../../../query-client';
import { apiBaseUrl, server } from '../../../mocks/server';
import { PendingMembers } from './pending-members';

const pendingResponse = {
  items: [
    {
      memberId: 101,
      userId: 201,
      name: '가입 신청자',
      phoneNumber: '010-1234-5678',
      signedUpAt: '2026-11-20T09:00:00Z',
      reviewStatus: 'PENDING',
    },
  ],
  nextCursor: null,
} satisfies PendingMemberListResponse;

const detailResponse = {
  memberId: 101,
  userId: 201,
  name: '가입 신청자',
  phoneNumber: '010-1234-5678',
  accountDeleted: false,
  signedUpAt: '2026-11-20T09:00:00Z',
  reviewStatus: 'PENDING',
  role: 'PLAYER',
  memberships: [
    {
      generationId: 33,
      joinedAs: 'ROSTER',
      status: 'ACTIVE',
      position: 'WEB',
    },
  ],
  rejectionReason: null,
} satisfies MemberDetailResponse;

const candidateResponse = [
  {
    rosterEntryId: 501,
    name: '가입 신청자',
    phoneNumber: '010-1234-5678',
    generationId: 33,
    position: 'WEB',
    role: 'PLAYER',
  },
] satisfies RosterCandidateView[];

beforeEach(() => {
  server.use(
    http.get(`${apiBaseUrl}/api/admin/membership-approvals`, () =>
      HttpResponse.json(pendingResponse),
    ),
    http.get(`${apiBaseUrl}/api/admin/membership-approvals/:memberId`, () =>
      HttpResponse.json(detailResponse),
    ),
    http.get(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/roster-candidates`, () =>
      HttpResponse.json(candidateResponse),
    ),
    http.post(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/approve`, () =>
      HttpResponse.json(detailResponse),
    ),
    http.post(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/reject`, () =>
      HttpResponse.json(detailResponse),
    ),
  );
});

async function setup() {
  const queryClient = createAdminQueryClient();
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <QueryClientProvider client={queryClient}>
          <AdminOverlayProvider>
            <PendingMembers />
          </AdminOverlayProvider>
        </QueryClientProvider>
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/members?tab=pending'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return userEvent.setup();
}

async function openReview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: '가입 신청자 가입 심사 상세' }));
  return screen.findByRole('heading', { name: '가입 심사 상세' });
}

it('PENDING 목록을 조회하고 회원 상세 패널을 연다', async () => {
  const user = await setup();

  const table = await screen.findByRole('table');
  expect(within(table).getByRole('row', { name: /가입 신청자/ })).toHaveTextContent(
    '가입 신청자010-1234-56782026.11.20PENDING상세 보기',
  );
  await openReview(user);
  expect(await screen.findByText('명단 매칭 후보')).toBeVisible();
  expect(screen.getAllByText('가입 신청자').length).toBeGreaterThan(1);
});

it('ROSTER 승인 요청을 보내고 성공 후 패널을 닫고 스낵바를 표시한다', async () => {
  const user = await setup();
  let requestBody: unknown;
  server.use(
    http.post(
      `${apiBaseUrl}/api/admin/membership-approvals/:memberId/approve`,
      async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(detailResponse);
      },
    ),
  );

  await openReview(user);
  await user.click(await screen.findByRole('button', { name: '선택' }));
  await user.click(screen.getByRole('button', { name: '승인하기' }));

  await waitFor(() =>
    expect(requestBody).toEqual({
      approvalType: 'ROSTER',
      role: 'PLAYER',
      generationId: 33,
      rosterEntryId: 501,
    }),
  );
  expect(await screen.findByText('가입 승인을 완료했어요.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: '가입 심사 상세' })).not.toBeInTheDocument();
});

it('MANUAL 승인 요청은 명단 ID 없이 직접 입력값을 보낸다', async () => {
  const user = await setup();
  let requestBody: unknown;
  server.use(
    http.post(
      `${apiBaseUrl}/api/admin/membership-approvals/:memberId/approve`,
      async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(detailResponse);
      },
    ),
  );

  await openReview(user);
  await user.click(screen.getByRole('radio', { name: 'MANUAL' }));
  await user.click(screen.getByRole('button', { name: '승인하기' }));

  await waitFor(() =>
    expect(requestBody).toEqual({
      approvalType: 'MANUAL',
      role: 'PLAYER',
      generationId: 33,
      position: 'WEB',
      phoneNumber: '010-1234-5678',
    }),
  );
});

it('반려 사유가 없으면 요청하지 않고, 입력 후 성공하면 패널을 닫는다', async () => {
  const user = await setup();
  let requestCount = 0;
  server.use(
    http.post(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/reject`, () => {
      requestCount += 1;
      return HttpResponse.json(detailResponse);
    }),
  );

  await openReview(user);
  await user.click(screen.getByRole('button', { name: '반려하기' }));
  expect(screen.getByRole('alert')).toHaveTextContent('반려 사유를 입력해 주세요.');
  expect(requestCount).toBe(0);

  await user.type(
    screen.getByRole('textbox', { name: '반려 사유' }),
    '가입 정보가 확인되지 않아요.',
  );
  await user.click(screen.getByRole('button', { name: '반려하기' }));

  await waitFor(() => expect(requestCount).toBe(1));
  expect(await screen.findByText('가입 반려를 완료했어요.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: '가입 심사 상세' })).not.toBeInTheDocument();
});
