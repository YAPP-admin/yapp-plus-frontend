/** 팀 상세 패널의 회원 검색 영역과 후보 선택 상태를 관리한다. */
import { useState } from 'react';
import {
  getCandidateMembers,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
  type TeamMemberChange,
} from '~/features/team-management';

type UseTeamMemberSearchParams = {
  snapshot: TeamMappingSnapshot;
  team: TeamMappingTeam;
  changes: readonly TeamMemberChange[];
  onSelectMember: (activityId: string) => void;
};

type UseTeamMemberSearchResult = {
  isAddOpen: boolean;
  query: string;
  candidates: ReturnType<typeof getCandidateMembers>;
  toggleAdd: () => void;
  setQuery: (query: string) => void;
  selectMember: (activityId: string) => void;
};

/** 원본 팀원을 제외한 후보 검색과 선택 후 검색어 초기화를 제공한다. */
export function useTeamMemberSearch({
  snapshot,
  team,
  changes,
  onSelectMember,
}: UseTeamMemberSearchParams): UseTeamMemberSearchResult {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const excludedActivityIds = new Set([
    ...team.memberActivityIds,
    ...changes
      .filter((change) => change.destinationTeamId === team.id)
      .map((change) => change.activityId),
  ]);
  const candidates = getCandidateMembers(snapshot, query, excludedActivityIds);

  function toggleAdd() {
    setIsAddOpen((current) => !current);
  }

  function selectMember(activityId: string) {
    onSelectMember(activityId);
    setQuery('');
  }

  return { isAddOpen, query, candidates, toggleAdd, setQuery, selectMember };
}
