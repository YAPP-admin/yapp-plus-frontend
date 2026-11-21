import type {
  AdminMemberDetailResponse,
  AdminMemberListResponse,
  AdminMemberTeamOptionResponse,
  GenerationRosterListResponse,
  GenerationRosterRegistrationResult,
  MemberDetailResponse,
  PendingMemberListResponse,
  RegisterGenerationRosterRequest,
  RosterCandidateView,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import {
  approveMembership,
  getMember,
  getMemberTeamOptions,
  getMembers,
  getMembershipApproval,
  getMembershipApprovals,
  getRosterCandidates,
  getRosterEntries,
  registerRoster,
  rejectMembership,
  updateMember,
} from './membership';

const memberListResponse = {
  items: [
    {
      memberId: 101,
      membershipId: 1001,
      name: '홍길동',
      position: 'WEB',
      status: 'PLAYER',
      previousActivities: [],
      attendanceScore: 98,
      signedUpDate: '2026-10-01',
      teamName: '1팀',
    },
  ],
  nextCursor: 'member-cursor',
} satisfies AdminMemberListResponse;

const memberDetailResponse = {
  memberId: 101,
  membershipId: 1001,
  name: '홍길동',
  position: 'WEB',
  status: 'PLAYER',
  previousActivities: [],
  attendanceScore: 98,
  signedUpDate: '2026-10-01',
  teamName: '1팀',
  phoneNumber: '+821012345678',
  revision: 3,
  changes: [],
} satisfies AdminMemberDetailResponse;

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

const rosterRequest = {
  generationId: 33,
  entries: [
    {
      clientRowId: 'row-1',
      generationId: 33,
      name: '김지원',
      phoneNumber: '010-8765-4321',
      position: 'WEB',
      role: 'PLAYER',
    },
  ],
} satisfies RegisterGenerationRosterRequest;

const rosterRegistrationResponse = {
  registrationId: 401,
  generationId: 33,
  rows: [{ clientRowId: 'row-1', rosterEntryId: 501, action: 'CREATED' }],
  createdCount: 1,
  updatedCount: 0,
  unchangedCount: 0,
} satisfies GenerationRosterRegistrationResult;

describe('Membership API adapter', () => {
  it('기수 회원 목록을 명시한 generationId와 필터로 조회한다', async () => {
    let requestUrl: URL | undefined;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/:generationId/members`, ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json(memberListResponse);
      }),
    );

    await expect(
      getMembers(33, { name: '홍길동', position: 'WEB', teamId: 7, cursor: 'member-cursor' }),
    ).resolves.toEqual(memberListResponse);

    expect(requestUrl?.pathname).toBe('/api/admin/generations/33/members');
    expect(requestUrl?.searchParams.get('name')).toBe('홍길동');
    expect(requestUrl?.searchParams.get('position')).toBe('WEB');
    expect(requestUrl?.searchParams.get('teamId')).toBe('7');
    expect(requestUrl?.searchParams.get('cursor')).toBe('member-cursor');
  });

  it('회원 상세를 조회하고 회원 정정 요청을 같은 generationId로 보낸다', async () => {
    let updateBody: unknown;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/33/members/101`, () =>
        HttpResponse.json(memberDetailResponse),
      ),
      http.put(`${apiBaseUrl}/api/admin/generations/33/members/101`, async ({ request }) => {
        updateBody = await request.json();
        return HttpResponse.json(memberDetailResponse);
      }),
    );

    await expect(getMember(33, 101)).resolves.toEqual(memberDetailResponse);
    await expect(
      updateMember(33, 101, {
        position: 'MOBILE',
        status: 'PLAYER',
        expectedRevision: 3,
      }),
    ).resolves.toEqual(memberDetailResponse);
    expect(updateBody).toEqual({
      position: 'MOBILE',
      status: 'PLAYER',
      expectedRevision: 3,
    });
  });

  it('회원 팀 선택지를 기수별로 조회한다', async () => {
    const response = [
      { teamId: 7, name: '1팀', playerMemberCount: 4 },
    ] satisfies AdminMemberTeamOptionResponse[];
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/33/member-team-options`, () =>
        HttpResponse.json(response),
      ),
    );

    await expect(getMemberTeamOptions(33)).resolves.toEqual(response);
  });

  it('사전 명단을 커서 조회한다', async () => {
    const response = {
      items: [
        {
          rosterEntryId: 501,
          name: '김지원',
          phoneNumber: '+821087654321',
          generationId: 33,
          position: 'WEB',
          role: 'PLAYER',
          status: 'AVAILABLE',
        },
      ],
      nextCursor: null,
    } satisfies GenerationRosterListResponse;
    let requestUrl: URL | undefined;
    server.use(
      http.get(
        `${apiBaseUrl}/api/admin/generations/:generationId/roster-entries`,
        ({ request }) => {
          requestUrl = new URL(request.url);
          return HttpResponse.json(response);
        },
      ),
    );

    await expect(getRosterEntries(33, { cursor: 'roster-cursor' })).resolves.toEqual(response);
    expect(requestUrl?.pathname).toBe('/api/admin/generations/33/roster-entries');
    expect(requestUrl?.searchParams.get('cursor')).toBe('roster-cursor');
  });

  it('명시한 generationId로 사전 명단을 등록한다', async () => {
    let requestBody: unknown;
    server.use(
      http.post(
        `${apiBaseUrl}/api/admin/generations/33/roster-registrations`,
        async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json(rosterRegistrationResponse, { status: 201 });
        },
      ),
    );

    await expect(registerRoster(33, rosterRequest)).resolves.toEqual(rosterRegistrationResponse);
    expect(requestBody).toEqual(rosterRequest);
  });

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
