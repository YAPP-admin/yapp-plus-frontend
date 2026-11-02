/** 팀 목록의 원본 분류와 미배정 회원 수를 URL 필터로 선택한다. */
import {
  getTeamFilterCounts,
  teamMappingFilterSchema,
  type TeamMappingFilter,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import { FilterSelect } from '~/shared/ui/filter-select';
import { teamMappingFilterLabels } from '../model/team-search';
import * as styles from './team-mapping-page.css';

/** 전체 팀과 미배정 회원 수를 포함한 팀 목록 필터를 표시한다. */
export function TeamFilters({
  snapshot,
  value,
  onChange,
}: {
  snapshot: TeamMappingSnapshot;
  value: TeamMappingFilter;
  onChange: (filter: TeamMappingFilter) => void;
}) {
  const counts = getTeamFilterCounts(snapshot);
  const labels: Record<TeamMappingFilter, string> = {
    all: `${teamMappingFilterLabels.all} · ${counts.all}`,
    unassigned: `${teamMappingFilterLabels.unassigned} · ${counts.unassigned}`,
  };

  return (
    <FilterSelect
      className={styles.filterField}
      label="팀 목록 필터"
      value={value}
      options={teamMappingFilterSchema.options}
      labels={labels}
      onChange={onChange}
    />
  );
}
