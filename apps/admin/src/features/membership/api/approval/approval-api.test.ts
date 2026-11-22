import type {
  MemberDetailResponse,
  PendingMemberListResponse,
  RosterCandidateView,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import {
  approveMembership,
  getMembershipApproval,
  getMembershipApprovals,
  getRosterCandidates,
  rejectMembership,
} from './approval-api';

const approvalDetailResponse = {
  memberId: 201,
  userId: 301,
  name: '김지원',
  phoneNumber: '+821087654321',
  accountDeleted: false,
  signedUpAt: '2026-10-02T03:04:05Z',
  reviewStatus: 'PENDING',
  role: null,
  memberships: [],
  rejectionReason: null,
} satisfies MemberDetailResponse;

describe('Approval API adapter', () => {
  it('가입 심사 목록을 상태·커서 필터로 조회한다', async () => {
    const response = {
      items: [
        {
          memberId: 201,
          userId: 301,
          name: '김지원',
          phoneNumber: '+821087654321',
          signedUpAt: '2026-10-02T03:04:05Z',
          reviewStatus: 'REJECTED',
        },
      ],
      nextCursor: 'approval-cursor',
    } satisfies PendingMemberListResponse;
    let requestUrl: URL | undefined;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/membership-approvals`, ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json(response);
      }),
    );

    await expect(
      getMembershipApprovals({ size: 20, cursor: 'approval-cursor', reviewStatus: 'REJECTED' }),
    ).resolves.toEqual(response);
    expect(requestUrl?.searchParams.get('size')).toBe('20');
    expect(requestUrl?.searchParams.get('cursor')).toBe('approval-cursor');
    expect(requestUrl?.searchParams.get('reviewStatus')).toBe('REJECTED');
  });

  it('가입 심사 상세와 명단 후보를 memberId·generationId로 조회한다', async () => {
    const candidates = [
      {
        rosterEntryId: 501,
        name: '김지원',
        phoneNumber: '+821087654321',
        generationId: 33,
        position: 'WEB',
        role: 'PLAYER',
      },
    ] satisfies RosterCandidateView[];
    server.use(
      http.get(`${apiBaseUrl}/api/admin/membership-approvals/201`, () =>
        HttpResponse.json(approvalDetailResponse),
      ),
      http.get(
        `${apiBaseUrl}/api/admin/membership-approvals/201/roster-candidates`,
        ({ request }) => {
          expect(new URL(request.url).searchParams.get('generationId')).toBe('33');
          return HttpResponse.json(candidates);
        },
      ),
    );

    await expect(getMembershipApproval(201)).resolves.toEqual(approvalDetailResponse);
    await expect(getRosterCandidates(33, 201)).resolves.toEqual(candidates);
  });

  it('가입 심사 승인·거절 요청을 generated body와 함께 보낸다', async () => {
    let approvedBody: unknown;
    let rejectedBody: unknown;
    server.use(
      http.post(`${apiBaseUrl}/api/admin/membership-approvals/201/approve`, async ({ request }) => {
        approvedBody = await request.json();
        return HttpResponse.json(approvalDetailResponse);
      }),
      http.post(`${apiBaseUrl}/api/admin/membership-approvals/201/reject`, async ({ request }) => {
        rejectedBody = await request.json();
        return HttpResponse.json(approvalDetailResponse);
      }),
    );

    const approvalBody = {
      approvalType: 'ROSTER',
      role: 'PLAYER',
      position: 'WEB',
      phoneNumber: '+821087654321',
      generationId: 33,
      rosterEntryId: 501,
    } as const;
    const rejectionBody = { reason: '명단 확인이 필요합니다.' };

    await expect(approveMembership(201, approvalBody)).resolves.toEqual(approvalDetailResponse);
    await expect(rejectMembership(201, rejectionBody)).resolves.toEqual(approvalDetailResponse);
    expect(approvedBody).toEqual(approvalBody);
    expect(rejectedBody).toEqual(rejectionBody);
  });
});
