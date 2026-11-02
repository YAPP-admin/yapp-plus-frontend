/** 생성 폼과 현재 작업의 팀원 변경 예정에서 공유하는 순수 검증 규칙이다. */
import {
  getMemberByActivityId,
  getMemberTeamId,
  getTeamById,
  type TeamMappingMember,
  type TeamMappingPart,
  type TeamMappingSnapshot,
} from './team-mapping';

/** 생성 모달이 소유하는 저장 전 입력이다. */
export type TeamDraftValues = Readonly<{
  name: string;
  serviceName: string;
  memberActivityIds: readonly string[];
}>;

/** 현재 작업에서 회원 한 명에게 지정한 변경 예정이다. */
export type TeamMemberChange = Readonly<{
  activityId: string;
  destinationTeamId: string | null;
}>;

/** 화면에 표시할 입력 오류이며 저장·원본 변경을 수행하지 않는다. */
export type TeamDraftIssue = Readonly<{
  field: 'name' | 'members' | 'changes';
  message: string;
}>;

const searchAliases: Readonly<Record<TeamMappingPart, readonly string[]>> = {
  pm: ['pm'],
  design: ['design', '디자인'],
  android: ['android'],
  ios: ['ios'],
  web: ['web'],
  server: ['server', '서버'],
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('ko-KR');
}

/** 이름·직군으로 후보를 검색하고 이미 선택한 활동은 제외한다. */
export function getCandidateMembers(
  snapshot: TeamMappingSnapshot,
  query: string,
  excludedActivityIds: ReadonlySet<string> = new Set(),
): readonly TeamMappingMember[] {
  const normalizedQuery = normalize(query);
  return snapshot.members.filter((member) => {
    if (excludedActivityIds.has(member.activityId)) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const nameMatches = normalize(member.name).includes(normalizedQuery);
    const partMatches = searchAliases[member.part].some((alias) =>
      normalize(alias).includes(normalizedQuery),
    );
    return nameMatches || partMatches;
  });
}

/** 새 팀의 필수 입력과 기존 팀 최소 인원 영향을 함께 검증한다. */
export function getTeamDraftIssues(
  snapshot: TeamMappingSnapshot,
  values: TeamDraftValues,
): readonly TeamDraftIssue[] {
  const issues: TeamDraftIssue[] = [];
  if (values.name.trim().length === 0) {
    issues.push({ field: 'name', message: '팀명을 입력하세요.' });
  }
  if (values.memberActivityIds.length === 0) {
    issues.push({ field: 'members', message: '팀원을 1명 이상 추가하세요.' });
  }

  const selected = new Set<string>();
  values.memberActivityIds.forEach((activityId) => {
    if (selected.has(activityId)) {
      issues.push({ field: 'members', message: '같은 회원을 중복으로 추가할 수 없습니다.' });
    }
    selected.add(activityId);
    if (getMemberByActivityId(snapshot, activityId) === undefined) {
      issues.push({ field: 'members', message: '존재하지 않는 회원을 추가할 수 없습니다.' });
    }
  });

  const changes = [...selected]
    .filter((activityId) => getMemberByActivityId(snapshot, activityId) !== undefined)
    .map((activityId) => ({
      activityId,
      destinationTeamId: 'new-team',
    }));
  issues.push(
    ...getTeamChangeIssues(snapshot, changes).map((issue): TeamDraftIssue => ({
      field: 'members',
      message: issue.message,
    })),
  );
  return issues;
}

/** 여러 회원의 이동·제외 예정이 기존 팀을 비우지 않는지 검증한다. */
export function getTeamChangeIssues(
  snapshot: TeamMappingSnapshot,
  changes: readonly TeamMemberChange[],
): readonly TeamDraftIssue[] {
  const issues: TeamDraftIssue[] = [];
  const seen = new Set<string>();
  const assignments = new Map<string, string | null>();

  changes.forEach((change) => {
    if (seen.has(change.activityId)) {
      issues.push({
        field: 'changes',
        message: '한 회원의 변경 예정은 하나만 지정할 수 있습니다.',
      });
    }
    seen.add(change.activityId);
    assignments.set(change.activityId, change.destinationTeamId);
    if (getMemberByActivityId(snapshot, change.activityId) === undefined) {
      issues.push({ field: 'changes', message: '존재하지 않는 회원의 배정을 변경할 수 없습니다.' });
    }
    if (change.destinationTeamId !== null && change.destinationTeamId !== 'new-team') {
      if (getTeamById(snapshot, change.destinationTeamId) === undefined) {
        issues.push({ field: 'changes', message: '존재하지 않는 팀으로 이동할 수 없습니다.' });
      }
      if (getMemberTeamId(snapshot, change.activityId) === change.destinationTeamId) {
        issues.push({
          field: 'changes',
          message: '현재 소속 팀과 같은 팀으로 이동할 수 없습니다.',
        });
      }
    }
  });

  snapshot.teams.forEach((team) => {
    const remaining = team.memberActivityIds.filter(
      (activityId) =>
        assignments.get(activityId) === undefined || assignments.get(activityId) === team.id,
    );
    if (remaining.length === 0) {
      issues.push({
        field: 'changes',
        message: `${team.name}은 최소 1명의 팀원을 유지해야 합니다.`,
      });
    }
  });
  return issues;
}

/** 공백을 정리한 생성 입력을 비교 가능한 문자열로 만든다. */
export function getTeamDraftSnapshot(values: TeamDraftValues): string {
  return JSON.stringify({
    name: values.name.trim(),
    serviceName: values.serviceName.trim(),
    memberActivityIds: [...values.memberActivityIds],
  });
}
