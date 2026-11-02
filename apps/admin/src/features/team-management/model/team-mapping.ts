/** 팀 매핑 화면이 공유하는 읽기 전용 원본 입력과 집계 규칙을 정의한다. */
import { z } from 'zod';

export const teamMappingStatusSchema = z.enum(['before', 'draft', 'confirmed']);
export const teamMappingPartSchema = z.enum(['pm', 'design', 'android', 'ios', 'web', 'server']);
export const teamMappingFilterSchema = z.enum(['all', 'complete', 'needs-check', 'unassigned']);

const identifier = z.string().trim().min(1);

export const teamMappingPartLabels: Readonly<Record<TeamMappingPart, string>> = {
  pm: 'PM',
  design: 'Design',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  server: 'Server',
};

/** 현재 기수에서 팀에 배정 가능한 회원 활동 입력이다. */
export const teamMappingMemberSchema = z
  .object({
    activityId: identifier,
    name: z.string().trim().min(1),
    part: teamMappingPartSchema,
    previousGenerations: z.number().int().positive().array().readonly(),
  })
  .readonly();

/** 팀 카드와 상세 패널이 사용하는 원본 팀 입력이다. */
export const teamMappingTeamSchema = z
  .object({
    id: identifier,
    name: z.string().trim().min(1),
    serviceName: z.string().trim().min(1).nullable(),
    memberActivityIds: identifier.array().min(1).readonly(),
    leaderActivityId: identifier.nullable(),
  })
  .readonly();

/** 확정됨 화면에 표시할 합성 확정 이력이다. 실제 저장 결과를 표현하지 않는다. */
export const teamMappingConfirmationSchema = z
  .object({
    confirmedAt: z.iso.datetime(),
    actorName: z.string().trim().min(1),
  })
  .readonly();

/** 팀·회원 참조와 상태 불변식을 함께 검증하는 화면 snapshot이다. */
export const teamMappingSnapshotSchema = z
  .object({
    generation: z.number().int().positive(),
    status: teamMappingStatusSchema,
    members: teamMappingMemberSchema.array().readonly(),
    teams: teamMappingTeamSchema.array().readonly(),
    confirmation: teamMappingConfirmationSchema.nullable(),
  })
  .superRefine((snapshot, context) => {
    const memberIds = new Set<string>();
    snapshot.members.forEach((member, index) => {
      if (memberIds.has(member.activityId)) {
        context.addIssue({
          code: 'custom',
          path: ['members', index, 'activityId'],
          message: '회원 활동 ID가 중복됩니다.',
        });
      }
      memberIds.add(member.activityId);
    });

    const teamIds = new Set<string>();
    const assignments = new Map<string, number>();
    snapshot.teams.forEach((team, teamIndex) => {
      if (teamIds.has(team.id)) {
        context.addIssue({
          code: 'custom',
          path: ['teams', teamIndex, 'id'],
          message: '팀 ID가 중복됩니다.',
        });
      }
      teamIds.add(team.id);

      const memberIdsInTeam = new Set<string>();
      team.memberActivityIds.forEach((activityId, memberIndex) => {
        if (memberIdsInTeam.has(activityId)) {
          context.addIssue({
            code: 'custom',
            path: ['teams', teamIndex, 'memberActivityIds', memberIndex],
            message: '같은 팀에 회원 활동이 중복됩니다.',
          });
        }
        memberIdsInTeam.add(activityId);

        if (!memberIds.has(activityId)) {
          context.addIssue({
            code: 'custom',
            path: ['teams', teamIndex, 'memberActivityIds', memberIndex],
            message: '존재하지 않는 회원 활동을 팀에 배정할 수 없습니다.',
          });
        }
        if (assignments.has(activityId)) {
          context.addIssue({
            code: 'custom',
            path: ['teams', teamIndex, 'memberActivityIds', memberIndex],
            message: '회원 활동은 여러 팀에 배정할 수 없습니다.',
          });
        }
        assignments.set(activityId, teamIndex);
      });

      if (team.leaderActivityId !== null) {
        if (!memberIdsInTeam.has(team.leaderActivityId)) {
          context.addIssue({
            code: 'custom',
            path: ['teams', teamIndex, 'leaderActivityId'],
            message: '팀장은 해당 팀의 회원이어야 합니다.',
          });
        }
      }
    });

    if (snapshot.status === 'before' && snapshot.teams.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['teams'],
        message: '팀 빌딩 전 상태에는 팀이 없어야 합니다.',
      });
    }
  })
  .readonly();

/** 원본 snapshot의 팀 매핑 상태다. */
export type TeamMappingStatus = z.infer<typeof teamMappingStatusSchema>;
/** 화면에서 사용하는 직군 식별자다. */
export type TeamMappingPart = z.infer<typeof teamMappingPartSchema>;
/** 팀 목록 필터 식별자다. */
export type TeamMappingFilter = z.infer<typeof teamMappingFilterSchema>;
/** 팀 매핑 후보 회원의 읽기 전용 입력이다. */
export type TeamMappingMember = z.infer<typeof teamMappingMemberSchema>;
/** 팀 카드와 상세 패널의 읽기 전용 팀 입력이다. */
export type TeamMappingTeam = z.infer<typeof teamMappingTeamSchema>;
/** 확정됨 화면에 표시할 합성 이력이다. */
export type TeamMappingConfirmation = z.infer<typeof teamMappingConfirmationSchema>;
/** 화면이 받는 팀 매핑 원본 snapshot이다. */
export type TeamMappingSnapshot = z.infer<typeof teamMappingSnapshotSchema>;

/** 팀의 직군별 원본 인원 집계다. */
export type TeamPartCounts = Readonly<Record<TeamMappingPart, number>>;

/** 활동 식별자로 원본 회원을 찾는다. 찾지 못하면 undefined를 반환한다. */
export function getMemberByActivityId(
  snapshot: TeamMappingSnapshot,
  activityId: string,
): TeamMappingMember | undefined {
  return snapshot.members.find((member) => member.activityId === activityId);
}

/** 팀 식별자로 원본 팀을 찾는다. 찾지 못하면 undefined를 반환한다. */
export function getTeamById(
  snapshot: TeamMappingSnapshot,
  teamId: string,
): TeamMappingTeam | undefined {
  return snapshot.teams.find((team) => team.id === teamId);
}

/** 회원 활동의 현재 원본 팀을 반환한다. 미배정이면 undefined다. */
export function getMemberTeamId(
  snapshot: TeamMappingSnapshot,
  activityId: string,
): string | undefined {
  return snapshot.teams.find((team) => team.memberActivityIds.includes(activityId))?.id;
}

/** 팀원 활동의 직군을 세어 팀 카드에 사용할 개수를 만든다. */
export function getTeamPartCounts(
  snapshot: TeamMappingSnapshot,
  team: TeamMappingTeam,
): TeamPartCounts {
  const counts: Record<TeamMappingPart, number> = {
    pm: 0,
    design: 0,
    android: 0,
    ios: 0,
    web: 0,
    server: 0,
  };
  team.memberActivityIds.forEach((activityId) => {
    const member = getMemberByActivityId(snapshot, activityId);
    if (member !== undefined) {
      counts[member.part] += 1;
    }
  });
  return counts;
}

/** PM과 Design이 모두 포함된 팀만 구성 완료로 분류한다. */
export function isTeamCompositionComplete(counts: TeamPartCounts): boolean {
  return counts.pm > 0 && counts.design > 0;
}

export function getTeamFilter(
  snapshot: TeamMappingSnapshot,
  team: TeamMappingTeam,
): TeamMappingFilter {
  return isTeamCompositionComplete(getTeamPartCounts(snapshot, team)) ? 'complete' : 'needs-check';
}

/** 팀원 목록을 원본 기준으로 계산해 미배정 회원만 반환한다. */
export function getUnassignedMembers(snapshot: TeamMappingSnapshot): readonly TeamMappingMember[] {
  const assigned = new Set(snapshot.teams.flatMap((team) => team.memberActivityIds));
  return snapshot.members.filter((member) => !assigned.has(member.activityId));
}

/** 필터에 해당하는 원본 팀 목록을 반환한다. 변경 예정은 반영하지 않는다. */
export function getTeamsForFilter(
  snapshot: TeamMappingSnapshot,
  filter: TeamMappingFilter,
): readonly TeamMappingTeam[] {
  if (filter === 'all' || filter === 'unassigned') {
    return snapshot.teams;
  }
  return snapshot.teams.filter((team) => getTeamFilter(snapshot, team) === filter);
}

/** 목록 필터 배지에 표시할 원본 팀·미배정 개수다. */
export function getTeamFilterCounts(snapshot: TeamMappingSnapshot) {
  return {
    all: snapshot.teams.length,
    complete: snapshot.teams.filter((team) => getTeamFilter(snapshot, team) === 'complete').length,
    needsCheck: snapshot.teams.filter((team) => getTeamFilter(snapshot, team) === 'needs-check')
      .length,
    unassigned: getUnassignedMembers(snapshot).length,
  } as const;
}
