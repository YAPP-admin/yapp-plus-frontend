/** 팀 API adapter가 생성 SDK의 경로·DTO 경계를 보존하는지 검증한다. */
import {
  handleCreate1,
  handleDelete,
  handleFind,
  handleFindAll,
  handleUpdate,
} from '@yapp-plus/api/generated/msw';
import type { CreateTeamRequest, TeamResponse, UpdateTeamRequest } from '@yapp-plus/api/generated';
import { HttpResponse } from 'msw';
import { expect, describe, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { createTeam, deleteTeam, getTeam, listTeams, updateTeam } from './team-api';

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

describe('team API adapter', () => {
  it('팀 목록·상세 조회의 명시적 path와 DTO 응답을 보존한다', async () => {
    server.use(
      handleFindAll({ body: [team] }, { baseUrl: apiBaseUrl }),
      handleFind({ body: team }, { baseUrl: apiBaseUrl }),
    );

    await expect(listTeams(33)).resolves.toEqual([team]);
    await expect(getTeam(33, 21)).resolves.toEqual(team);
  });

  it('팀 생성·수정 body를 그대로 전달하고 서버 DTO를 반환한다', async () => {
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
    );

    await expect(createTeam(33, createBody)).resolves.toEqual(team);
    await expect(updateTeam(33, 21, updateBody)).resolves.toEqual(team);
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
});
