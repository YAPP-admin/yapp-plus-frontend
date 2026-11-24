/** 팀 목록의 원본 분류와 미배정 회원 수를 URL 필터로 선택한다. */
import { Chip, RadioGroup, RadioGroupField } from '@seed-design/react';
import {
  getTeamFilterCounts,
  teamMappingFilterSchema,
  type TeamMappingFilter,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import { teamMappingFilterLabels } from '../model/team-search';
import * as styles from './team-mapping-page.css';

/** 전체·구성 상태·미배정 회원 수를 포함한 팀 목록 필터를 표시한다. */
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
    complete: `${teamMappingFilterLabels.complete} · ${counts.complete}`,
    'needs-check': `${teamMappingFilterLabels['needs-check']} · ${counts.needsCheck}`,
    unassigned: `${teamMappingFilterLabels.unassigned} · ${counts.unassigned}`,
  };

  return (
    <RadioGroupField.Root.Primitive
      className={styles.teamFilters}
      aria-label="팀 목록 필터"
      value={value}
      onValueChange={(nextValue) => onChange(teamMappingFilterSchema.parse(nextValue))}
    >
      {teamMappingFilterSchema.options.map((filter) => (
        <Chip.Button key={filter} asChild size="large" variant="solid">
          <RadioGroup.Item.Primitive value={filter}>
            <Chip.Label>{labels[filter]}</Chip.Label>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item.Primitive>
        </Chip.Button>
      ))}
    </RadioGroupField.Root.Primitive>
  );
}
