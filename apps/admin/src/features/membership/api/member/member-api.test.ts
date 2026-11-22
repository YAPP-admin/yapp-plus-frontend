import type {
  AdminMemberDetailResponse,
  AdminMemberListResponse,
  AdminMemberTeamOptionResponse,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { getMember, getMemberTeamOptions, getMembers, updateMember } from './member-api';

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

describe('Member API adapter', () => {
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
});
