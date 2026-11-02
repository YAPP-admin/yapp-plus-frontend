/** 후보 검색·생성 입력·팀원 변경 예정의 순수 정책을 검증한다. */
import { describe, expect, it } from 'vitest';
import {
  createTeamDraftSchema,
  getCandidateMembers,
  getTeamChangeIssues,
  getTeamDraftIssues,
  getTeamDraftSnapshot,
  teamMappingSnapshotSchema,
} from '../index';

const snapshot = teamMappingSnapshotSchema.parse({
  generation: 33,
  status: 'draft',
  members: [
    { activityId: 'pm-1', name: '김피엠', part: 'pm', previousGenerations: [] },
    { activityId: 'design-1', name: '김디자인', part: 'design', previousGenerations: [] },
    { activityId: 'server-1', name: '서버김', part: 'server', previousGenerations: [] },
    { activityId: 'unassigned-1', name: '김미배정', part: 'web', previousGenerations: [32] },
    { activityId: 'same-name-1', name: '김피엠', part: 'android', previousGenerations: [] },
  ],
  teams: [
    {
      id: 'team-one',
      name: '1팀',
      serviceName: '서비스',
      memberActivityIds: ['pm-1', 'design-1'],
      leaderActivityId: 'pm-1',
    },
    {
      id: 'team-two',
      name: '2팀',
      serviceName: null,
      memberActivityIds: ['server-1'],
      leaderActivityId: null,
    },
  ],
  confirmation: null,
});

describe('팀 후보 검색', () => {
  it('이름·직군 별칭으로 검색하고 선택 후보를 제외한다', () => {
    expect(getCandidateMembers(snapshot, '김').map((member) => member.activityId)).toEqual([
      'pm-1',
      'design-1',
      'server-1',
      'unassigned-1',
      'same-name-1',
    ]);
    expect(getCandidateMembers(snapshot, '디자인').map((member) => member.activityId)).toEqual([
      'design-1',
    ]);
    expect(getCandidateMembers(snapshot, 'server').map((member) => member.activityId)).toEqual([
      'server-1',
    ]);
    expect(
      getCandidateMembers(snapshot, '김', new Set(['same-name-1'])).map(
        (member) => member.activityId,
      ),
    ).not.toContain('same-name-1');
  });
});

describe('팀 생성·변경 예정 검증', () => {
  it('Zod 스키마가 도메인 오류를 필드 경로로 연결한다', () => {
    const result = createTeamDraftSchema(snapshot).safeParse({
      name: ' ',
      serviceName: '',
      memberActivityIds: [],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map(({ path, message }) => ({ path, message }))).toEqual([
      { path: ['name'], message: '팀명을 입력하세요.' },
      { path: ['memberActivityIds'], message: '팀원을 1명 이상 추가하세요.' },
    ]);
  });

  it('팀명·팀원 필수와 중복·존재하지 않는 회원을 검증한다', () => {
    expect(
      getTeamDraftIssues(snapshot, { name: ' ', serviceName: '', memberActivityIds: [] }),
    ).toEqual([
      { field: 'name', message: '팀명을 입력하세요.' },
      { field: 'members', message: '팀원을 1명 이상 추가하세요.' },
    ]);
    expect(
      getTeamDraftIssues(snapshot, {
        name: '새 팀',
        serviceName: '',
        memberActivityIds: ['unassigned-1', 'unassigned-1', 'missing'],
      }),
    ).toEqual([
      { field: 'members', message: '같은 회원을 중복으로 추가할 수 없습니다.' },
      { field: 'members', message: '존재하지 않는 회원을 추가할 수 없습니다.' },
    ]);
  });

  it('기존 팀의 마지막 회원을 이동·제외하는 변경을 막고 정상 변경은 허용한다', () => {
    expect(
      getTeamChangeIssues(snapshot, [{ activityId: 'server-1', destinationTeamId: null }]),
    ).toEqual([{ field: 'changes', message: '2팀은 최소 1명의 팀원을 유지해야 합니다.' }]);
    expect(
      getTeamChangeIssues(snapshot, [{ activityId: 'pm-1', destinationTeamId: 'team-two' }]),
    ).toEqual([]);
    expect(
      getTeamChangeIssues(snapshot, [
        { activityId: 'pm-1', destinationTeamId: 'team-two' },
        { activityId: 'design-1', destinationTeamId: null },
      ]),
    ).toEqual([{ field: 'changes', message: '1팀은 최소 1명의 팀원을 유지해야 합니다.' }]);
  });

  it('초안 스냅샷은 저장 가능한 값만 정규화한다', () => {
    expect(
      getTeamDraftSnapshot({
        name: ' 새 팀 ',
        serviceName: ' 서비스 ',
        memberActivityIds: ['b', 'a'],
      }),
    ).toBe(JSON.stringify({ name: '새 팀', serviceName: '서비스', memberActivityIds: ['b', 'a'] }));
  });
});
