/** 가입 심사 목록과 승인·신규 등록·거절 Dialog 흐름을 생성 API 계약으로 검증합니다. */
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

async function openApprovalDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: '가입 신청자 승인' }));
  return screen.findByRole('heading', { name: '가입 신청자님을 명단에서 찾았어요' });
}

async function openRejectionDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: '가입 신청자 거절' }));
  return screen.findByRole('heading', { name: '가입 거절' });
}

it('PENDING 목록에서 신청일을 표시하고 상태·더보기 버튼 없이 승인·거절 버튼을 제공한다', async () => {
  const user = await setup();

  const table = await screen.findByRole('table');
  expect(within(table).getByRole('row', { name: /가입 신청자/ })).toHaveTextContent(
    '가입 신청자010-1234-56782026.11.20승인거절',
  );
  expect(within(table).getByRole('columnheader', { name: '신청일' })).toBeVisible();
  expect(within(table).queryByRole('columnheader', { name: '상태' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '다음 가입 신청 불러오기' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '가입 신청자 승인' })).toBeVisible();
  expect(screen.getByRole('button', { name: '가입 신청자 거절' })).toBeVisible();

  await openApprovalDialog(user);
  expect(await screen.findByText('후보 회원')).toBeVisible();
});

it('명단 후보가 없으면 회원 이름을 포함한 승인 확인 문구를 표시한다', async () => {
  const user = await setup();
  server.use(
    http.get(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/roster-candidates`, () =>
      HttpResponse.json([]),
    ),
  );

  await user.click(await screen.findByRole('button', { name: '가입 신청자 승인' }));

  expect(
    await screen.findByRole('heading', { name: '가입 신청자님의 가입을 승인하시겠어요?' }),
  ).toBeVisible();
  expect(screen.getByText('일치하는 후보 회원이 없어요.')).toBeVisible();
});

it('명단 후보를 선택해 연결 승인하고 성공 후 Dialog를 닫고 스낵바를 표시한다', async () => {
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

  await openApprovalDialog(user);
  expect(await screen.findByRole('radio')).toBeChecked();
  await user.click(screen.getByRole('button', { name: '이 회원과 연결' }));

  await waitFor(() =>
    expect(requestBody).toEqual({
      approvalType: 'ROSTER',
      role: 'PLAYER',
      generationId: 33,
      rosterEntryId: 501,
    }),
  );
  expect(await screen.findByText('가입 승인을 완료했어요.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: '가입 심사' })).not.toBeInTheDocument();
});

it('새 회원으로 등록을 누르면 등록 Dialog로 이동하고 저장 시 MANUAL 승인 요청을 보낸다', async () => {
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

  await openApprovalDialog(user);
  await user.click(screen.getByRole('button', { name: '새 회원으로 등록' }));
  expect(await screen.findByRole('heading', { name: '신규 회원 등록' })).toBeVisible();
  const roleSelect = screen.getByRole('combobox', { name: '권한' });
  expect(roleSelect).toHaveTextContent('활동회원');
  await user.click(roleSelect);
  expect(screen.getAllByText('정회원').at(-1)).toBeVisible();
  expect(screen.getAllByText('운영진').at(-1)).toBeVisible();
  await user.click(screen.getByRole('button', { name: '저장하기' }));

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

it('거절 버튼은 사유 입력 Dialog를 열고 줄바꿈·특수문자를 그대로 전송한다', async () => {
  const user = await setup();
  let requestBody: unknown;
  server.use(
    http.post(
      `${apiBaseUrl}/api/admin/membership-approvals/:memberId/reject`,
      async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(detailResponse);
      },
    ),
  );

  await openRejectionDialog(user);
  const reasonInput = screen.getByRole('textbox', { name: '거절 사유' });
  expect(reasonInput).toHaveAttribute('maxlength', '2000');
  expect(screen.getByText('앱 화면에 사유가 노출돼요.')).toBeVisible();
  expect(screen.getByRole('button', { name: '거절하기' })).toBeDisabled();

  await user.type(reasonInput, '가입 정보가 확인되지 않아요.\n특수문자: !@#$%');
  expect(screen.getByText('28/2000')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '거절하기' }));

  await waitFor(() =>
    expect(requestBody).toEqual({
      reason: '가입 정보가 확인되지 않아요.\n특수문자: !@#$%',
    }),
  );
  expect(await screen.findByText('가입 거절을 완료했어요.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: '가입 거절' })).not.toBeInTheDocument();
});

it('거절 API의 INVALID_MEMBER_REQUEST 메시지를 표시한다', async () => {
  const user = await setup();
  server.use(
    http.post(`${apiBaseUrl}/api/admin/membership-approvals/:memberId/reject`, () =>
      HttpResponse.json(
        {
          code: 'INVALID_MEMBER_REQUEST',
          message: '거절 사유는 1~2,000자로 입력해 주세요.',
        },
        { status: 400 },
      ),
    ),
  );

  await openRejectionDialog(user);
  await user.type(screen.getByRole('textbox', { name: '거절 사유' }), '가입 정보');
  await user.click(screen.getByRole('button', { name: '거절하기' }));

  expect(await screen.findByText('거절 사유는 1~2,000자로 입력해 주세요.')).toBeVisible();
  expect(screen.getByRole('heading', { name: '가입 거절' })).toBeInTheDocument();
});
