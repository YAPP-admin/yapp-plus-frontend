/** 팀 원본 참조·집계·구성 분류가 변경 예정 없이 동작하는지 검증한다. */
import { describe, expect, it } from 'vitest';
import {
  getTeamFilter,
  getTeamFilterCounts,
  getTeamPartCounts,
  getTeamsForFilter,
  getUnassignedMembers,
  teamMappingSnapshotSchema,
} from '../index';

const members = [
  { activityId: 'pm-1', name: '김피엠', part: 'pm', previousGenerations: [] },
  { activityId: 'design-1', name: '김디자인', part: 'design', previousGenerations: [] },
  { activityId: 'android-1', name: '김안드로이드', part: 'android', previousGenerations: [] },
  { activityId: 'unassigned-1', name: '김미배정', part: 'web', previousGenerations: [32] },
] as const;

const snapshot = teamMappingSnapshotSchema.parse({
  generation: 33,
  status: 'draft',
  members,
  teams: [
    {
      id: 'team-complete',
      name: '1팀 모아',
      serviceName: '일정 조율',
      memberActivityIds: ['pm-1', 'design-1'],
      leaderActivityId: 'pm-1',
    },
    {
      id: 'team-needs-check',
      name: '2팀 루틴',
      serviceName: null,
      memberActivityIds: ['android-1'],
      leaderActivityId: null,
    },
  ],
  confirmation: null,
});

describe('팀 매핑 원본 집계', () => {
  it('직군 수와 PM·Design 구성 상태를 계산한다', () => {
    const complete = snapshot.teams[0];
    const needsCheck = snapshot.teams[1];
    if (complete === undefined || needsCheck === undefined) {
      throw new Error('팀 fixture가 비어 있습니다.');
    }
    expect(getTeamPartCounts(snapshot, complete)).toEqual({
      pm: 1,
      design: 1,
      android: 0,
      ios: 0,
      web: 0,
      server: 0,
    });
    expect(getTeamFilter(snapshot, complete)).toBe('complete');
    expect(getTeamFilter(snapshot, needsCheck)).toBe('needs-check');
  });

  it('미배정 회원과 필터별 개수를 원본에서 계산한다', () => {
    expect(getUnassignedMembers(snapshot).map((member) => member.activityId)).toEqual([
      'unassigned-1',
    ]);
    expect(getTeamFilterCounts(snapshot)).toEqual({
      all: 2,
      complete: 1,
      needsCheck: 1,
      unassigned: 1,
    });
    expect(getTeamsForFilter(snapshot, 'complete').map((team) => team.id)).toEqual([
      'team-complete',
    ]);
    expect(getTeamsForFilter(snapshot, 'needs-check').map((team) => team.id)).toEqual([
      'team-needs-check',
    ]);
  });
});

describe('팀 매핑 원본 검증', () => {
  it('중복 소속과 팀장 외부 참조를 정확한 경로로 거부한다', () => {
    const result = teamMappingSnapshotSchema.safeParse({
      ...snapshot,
      teams: [
        snapshot.teams[0],
        {
          ...snapshot.teams[1],
          memberActivityIds: ['android-1', 'pm-1'],
          leaderActivityId: 'pm-1',
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      '회원 활동은 여러 팀에 배정할 수 없습니다.',
    ]);
  });

  it('팀 빌딩 전에는 팀이 있는 입력을 허용하지 않는다', () => {
    const result = teamMappingSnapshotSchema.safeParse({ ...snapshot, status: 'before' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('팀 빌딩 전 상태에는 팀이 없어야 합니다.');
  });
});
