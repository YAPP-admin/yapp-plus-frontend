/** Team API adapter가 생성 SDK의 경로·DTO 경계를 보존하는지 검증한다. */
import {
  handleCandidates,
  handleCreate1,
  handleDelete,
  handleFind,
  handleFindAll,
  handleReplaceMembers,
  handleUpdate,
} from '@yapp-plus/api/generated/msw';
import type {
  CreateTeamRequest,
  ReplaceTeamMembersRequest,
  TeamMemberCandidateResponse,
  TeamResponse,
  UpdateTeamRequest,
} from '@yapp-plus/api/generated';
import { HttpResponse } from 'msw';
import { expect, describe, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import {
  createTeam,
  deleteTeam,
  getTeam,
  listTeamMemberCandidates,
  listTeams,
  replaceTeamMembers,
  updateTeam,
} from './team-api';

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

describe('team API adapter', () => {
  it('팀 목록·상세·후보 조회의 명시적 path와 DTO 응답을 보존한다', async () => {
    server.use(
      handleFindAll({ body: [team] }, { baseUrl: apiBaseUrl }),
      handleFind({ body: team }, { baseUrl: apiBaseUrl }),
      handleCandidates({ body: candidates }, { baseUrl: apiBaseUrl }),
    );

    await expect(listTeams(33)).resolves.toEqual([team]);
    await expect(getTeam(33, 21)).resolves.toEqual(team);
    await expect(listTeamMemberCandidates(33)).resolves.toEqual(candidates);
  });

  it('생성·수정·팀원 교체 body를 그대로 전달하고 서버 DTO를 반환한다', async () => {
    const createBody: CreateTeamRequest = {
      name: 'Pocket',
      serviceName: null,
      members: [{ membershipId: 103, expectedCurrentTeamId: null }],
    };
    const updateBody: UpdateTeamRequest = {
      expectedVersion: 4,
      name: 'Orbit Updated',
      serviceName: 'Updated service',
    };
    const replaceBody: ReplaceTeamMembersRequest = {
      expectedVersion: 5,
      members: [
        { membershipId: 101, expectedCurrentTeamId: 21 },
        { membershipId: 103, expectedCurrentTeamId: null },
      ],
    };

    server.use(
      handleCreate1(
        async ({ params, request }) => {
          expect(params.generationId).toBe('33');
          expect(await request.json()).toEqual(createBody);
          return HttpResponse.json(team, { status: 201 });
        },
        { baseUrl: apiBaseUrl },
      ),
      handleUpdate(
        async ({ params, request }) => {
          expect(params.generationId).toBe('33');
          expect(params.teamId).toBe('21');
          expect(await request.json()).toEqual(updateBody);
          return HttpResponse.json(team, { status: 200 });
        },
        { baseUrl: apiBaseUrl },
      ),
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

    await expect(createTeam(33, createBody)).resolves.toEqual(team);
    await expect(updateTeam(33, 21, updateBody)).resolves.toEqual(team);
    await expect(replaceTeamMembers(33, 21, replaceBody)).resolves.toEqual(team);
  });

  it('팀 삭제는 명시적 generationId·teamId로 204를 요청한다', async () => {
    server.use(
      handleDelete(
        ({ params }) => {
          expect(params.generationId).toBe('33');
          expect(params.teamId).toBe('21');
          return new HttpResponse(null, { status: 204 });
        },
        { baseUrl: apiBaseUrl },
      ),
    );

    await expect(deleteTeam(33, 21)).resolves.toBeUndefined();
  });

  it('assigned 필터를 후보 조회 query로만 전달한다', async () => {
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
