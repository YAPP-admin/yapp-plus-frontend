import type { Member } from '~/features/member-management';
import type { MemberSearch } from './member-search';

export function filterMembers(
  members: readonly Member[],
  currentGeneration: number,
  search: Pick<MemberSearch, 'q' | 'part'>,
) {
  const query = search.q.trim();
  return members
    .filter((member) => {
      const activity = member.activities.find((item) => item.generation === currentGeneration);
      return (
        activity &&
        member.name.includes(query) &&
        (search.part === 'all' || activity.part === search.part)
      );
    })
    .toSorted((a, b) => a.name.localeCompare(b.name, 'ko') || a.id.localeCompare(b.id, 'en'));
}
