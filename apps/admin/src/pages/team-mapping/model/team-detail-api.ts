import type { TeamResponse } from '@yapp-plus/api/generated';
import {
  teamMappingSnapshotSchema,
  type TeamMappingMember,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';

/** 목록 fixture와 API 응답을 함께 사용하는 동안 팀 식별자를 API path 값으로 변환한다. */
export function getTeamApiId(teamId: string): number | undefined {
  const numericId = Number(teamId);
  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  const fixtureId = /^team-(\d+)$/.exec(teamId)?.[1];
  if (fixtureId === undefined) {
    return undefined;
  }

  const parsedFixtureId = Number(fixtureId);
  return Number.isInteger(parsedFixtureId) && parsedFixtureId > 0 ? parsedFixtureId : undefined;
}

function toTeamMappingPart(position: TeamResponse['members'][number]['position']) {
  switch (position) {
    case 'PM':
      return 'pm' as const;
    case 'DESIGN':
      return 'design' as const;
    case 'ANDROID':
      return 'android' as const;
    case 'IOS':
      return 'ios' as const;
    case 'WEB':
      return 'web' as const;
    case 'MOBILE':
      return 'mobile' as const;
    case 'SERVER':
      return 'server' as const;
    case 'AI_NATIVE':
      return 'ai-native' as const;
    case null:
      return 'unassigned' as const;
    default:
      return 'unassigned' as const;
  }
}

/** 팀 상세 API 응답을 현재 팀 매핑 패널이 사용하는 snapshot 형태로 변환한다. */
export function applyTeamDetailResponse(
  snapshot: TeamMappingSnapshot,
  team: TeamMappingTeam,
  response: TeamResponse,
): { snapshot: TeamMappingSnapshot; team: TeamMappingTeam } {
  const existingMembers = new Map(snapshot.members.map((member) => [member.activityId, member]));
  const detailMembers: TeamMappingMember[] = response.members.map((member) => {
    const activityId = String(member.membershipId);
    return {
      activityId,
      name: member.name,
      part: toTeamMappingPart(member.position),
      previousGenerations: existingMembers.get(activityId)?.previousGenerations ?? [],
    };
  });
  const memberActivityIds = detailMembers.map((member) => member.activityId);
  const detailTeam: TeamMappingTeam = {
    ...team,
    id: String(response.teamId),
    name: response.name,
    serviceName: response.serviceName,
    memberActivityIds,
    leaderActivityId: detailMembers.find((member) => member.part === 'pm')?.activityId ?? null,
  };
  const detailMemberIds = new Set(detailMembers.map((member) => member.activityId));
  const mergedMembers = [
    ...snapshot.members.filter((member) => !detailMemberIds.has(member.activityId)),
    ...detailMembers,
  ];
  const mergedTeams = snapshot.teams.map((candidate) =>
    candidate.id === team.id ? detailTeam : candidate,
  );

  return {
    snapshot: teamMappingSnapshotSchema.parse({
      ...snapshot,
      members: mergedMembers,
      teams: mergedTeams,
    }),
    team: detailTeam,
  };
}
