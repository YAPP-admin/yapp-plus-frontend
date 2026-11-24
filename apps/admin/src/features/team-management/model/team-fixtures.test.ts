/** 팀 매핑 합성 fixture의 참조 무결성과 화면 시나리오를 검증한다. */
import { describe, expect, it } from 'vitest';

import { getCandidateMembers } from './team-draft';
import {
  getTeamFilterCounts,
  getTeamsForFilter,
  getUnassignedMembers,
  teamMappingSnapshotSchema,
} from './team-mapping';
import {
  getTeamMappingFixture,
  teamMappingDraftFixture,
  teamMappingFixtures,
} from './team-fixtures';

describe('team mapping fixtures', () => {
  it.each(['before', 'draft'] as const)('validates the %s snapshot', (status) => {
    const result = teamMappingSnapshotSchema.safeParse(getTeamMappingFixture(status));

    expect(result.success).toBe(true);
  });

  it('provides 52 candidates and the requested draft counts', () => {
    expect(teamMappingDraftFixture.members).toHaveLength(52);
    expect(teamMappingDraftFixture.teams).toHaveLength(8);
    expect(getUnassignedMembers(teamMappingDraftFixture)).toHaveLength(10);
    expect(getTeamFilterCounts(teamMappingDraftFixture)).toEqual({
      all: 8,
      complete: 7,
      needsCheck: 1,
      unassigned: 10,
    });
  });

  it('keeps before empty and draft counts deterministic', () => {
    expect(teamMappingFixtures.before.teams).toHaveLength(0);
    expect(getUnassignedMembers(teamMappingFixtures.before)).toHaveLength(52);
    expect(getTeamFilterCounts(teamMappingDraftFixture)).toEqual({
      all: 8,
      complete: 7,
      needsCheck: 1,
      unassigned: 10,
    });
  });

  it('includes duplicate names, a one-member team, and a long member name', () => {
    const duplicateNames = teamMappingDraftFixture.members.filter(
      (member) => member.name === '김태윤',
    );
    const oneMemberTeam = teamMappingDraftFixture.teams.find((team) => team.id === 'team-08');
    const longNameMember = teamMappingDraftFixture.members.find((member) =>
      member.name.includes('아주긴이름'),
    );

    expect(duplicateNames.map((member) => member.activityId)).toEqual(['member-21', 'member-26']);
    expect(oneMemberTeam?.memberActivityIds).toEqual(['member-40']);
    expect(longNameMember?.activityId).toBe('member-40');
  });

  it('keeps explicit empty search and filter results reproducible', () => {
    expect(getCandidateMembers(teamMappingDraftFixture, '없는회원검색어')).toEqual([]);
    expect(getTeamsForFilter(teamMappingDraftFixture, 'unassigned')).toHaveLength(8);
  });

  it('returns the same status mapping without environment branching', () => {
    expect(getTeamMappingFixture()).toBe(teamMappingFixtures.before);
    expect(getTeamMappingFixture('before')).toBe(teamMappingFixtures.before);
    expect(getTeamMappingFixture('draft')).toBe(teamMappingFixtures.draft);
  });
});
