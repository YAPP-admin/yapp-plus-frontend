import type { Member } from '~/features/member-management';
import type { MemberSearch } from './member-search';

export const unassignedTeamId = 'unassigned';

export type MemberTeamOption = {
  id: string;
  name: string;
  count: number;
};

export function getMemberTeamOptions(
  members: readonly Member[],
  currentGeneration: number,
): readonly MemberTeamOption[] {
  const teams = members
    .flatMap((member) => member.activities.filter((item) => item.generation === currentGeneration))
    .reduce((teamMap, activity) => {
      const team = activity.team ?? { id: unassignedTeamId, name: '팀 미배정' };
      const option = teamMap.get(team.id);
      if (option === undefined) {
        teamMap.set(team.id, { id: team.id, name: team.name, count: 1 });
      } else {
        option.count += 1;
      }
      return teamMap;
    }, new Map<string, MemberTeamOption>());

  return [...teams.values()].toSorted((a, b) => {
    if (a.id === unassignedTeamId) {
      return 1;
    }
    if (b.id === unassignedTeamId) {
      return -1;
    }
    return a.name.localeCompare(b.name, 'ko') || a.id.localeCompare(b.id, 'en');
  });
}

export function filterMembers(
  members: readonly Member[],
  currentGeneration: number,
  search: Pick<MemberSearch, 'q' | 'part' | 'team'>,
) {
  const query = search.q.trim();
  const teamIds = new Set(getMemberTeamOptions(members, currentGeneration).map((team) => team.id));
  const team = search.team !== undefined && teamIds.has(search.team) ? search.team : undefined;
  return members
    .filter((member) => {
      const activity = member.activities.find((item) => item.generation === currentGeneration);
      return (
        activity &&
        member.name.includes(query) &&
        (search.part === 'all' || activity.part === search.part) &&
        (team === undefined ||
          (team === unassignedTeamId ? activity.team === null : activity.team?.id === team))
      );
    })
    .toSorted((a, b) => a.name.localeCompare(b.name, 'ko') || a.id.localeCompare(b.id, 'en'));
}
