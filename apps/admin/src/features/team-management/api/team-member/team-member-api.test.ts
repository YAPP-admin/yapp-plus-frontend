/** 팀원·후보 API adapter가 생성 SDK의 경로·DTO 경계를 보존하는지 검증한다. */
import { handleCandidates, handleReplaceMembers } from '@yapp-plus/api/generated/msw';
import type {
  ReplaceTeamMembersRequest,
  TeamMemberCandidateResponse,
  TeamResponse,
} from '@yapp-plus/api/generated';
import { HttpResponse } from 'msw';
import { expect, describe, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { listTeamMemberCandidates, replaceTeamMembers } from './team-member-api';

const team: TeamResponse = {
  teamId: 21,
  name: 'Orbit',
  serviceName: 'YAPP Orbit',
  totalMemberCount: 2,
  version: 4,
  members: [
    { membershipId: 101, name: '김민서', position: 'PM' },
    { membershipId: 102, name: '이서윤', position: 'DESIGN' },
  ],
};

const candidates: TeamMemberCandidateResponse[] = [
  {
    membershipId: 101,
    name: '김민서',
    position: 'PM',
    assigned: true,
    currentTeam: { teamId: 21, name: 'Orbit' },
  },
  {
    membershipId: 103,
    name: '박지훈',
    position: 'ANDROID',
    assigned: false,
    currentTeam: null,
  },
];

describe('team member API adapter', () => {
  it('팀원 전체 교체 body를 그대로 전달하고 서버 DTO를 반환한다', async () => {
    const replaceBody: ReplaceTeamMembersRequest = {
      expectedVersion: 5,
      members: [
        { membershipId: 101, expectedCurrentTeamId: 21 },
        { membershipId: 103, expectedCurrentTeamId: null },
      ],
    };

    server.use(
      handleReplaceMembers(
        async ({ params, request }) => {
          expect(params.generationId).toBe('33');
          expect(params.teamId).toBe('21');
          expect(await request.json()).toEqual(replaceBody);
          return HttpResponse.json(team, { status: 200 });
        },
        { baseUrl: apiBaseUrl },
      ),
    );

    await expect(replaceTeamMembers(33, 21, replaceBody)).resolves.toEqual(team);
  });

  it('팀원 후보 목록과 assigned 필터를 보존한다', async () => {
    server.use(
      handleCandidates(
        ({ request }) => {
          expect(new URL(request.url).search).toBe('?assigned=false');
          return HttpResponse.json(candidates, { status: 200 });
        },
        { baseUrl: apiBaseUrl },
      ),
    );

    await expect(listTeamMemberCandidates(33, false)).resolves.toEqual(candidates);
  });
});
