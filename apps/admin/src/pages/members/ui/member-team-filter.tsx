import { Box, HStack, Text } from '@seed-design/react';
import { Info } from 'lucide-react';
import type { Member } from '~/features/member-management';
import { FilterSelect } from '~/shared/ui/filter-select';
import { getMemberTeamOptions } from '../model/member-list';
import * as styles from './member-team-filter.css';

export type MemberTeamMapping = 'before' | 'after';

export function MemberTeamFilter({
  members,
  currentGeneration,
  value,
  onChange,
}: {
  members: readonly Member[];
  currentGeneration: number;
  value: string | undefined;
  onChange: (team: string | undefined) => void;
}) {
  const options = getMemberTeamOptions(members, currentGeneration);
  const values = ['all', ...options.map((option) => option.id)];
  const labels: Record<string, string> = Object.fromEntries([
    ['all', `전체 팀 · ${options.reduce((total, option) => total + option.count, 0)}명`],
    ...options.map((option) => [option.id, `${option.name} · ${option.count}명`]),
  ]);
  const selectedTeam = values.includes(value ?? '') ? value : undefined;

  return (
    <FilterSelect
      label="팀"
      value={selectedTeam ?? 'all'}
      options={values}
      labels={labels}
      onChange={(next) => onChange(next === 'all' ? undefined : next)}
    />
  );
}

export function TeamMappingNotice() {
  return (
    <Box className={styles.notice} as="section" aria-label="팀 매핑 안내">
      <HStack align="flex-start" gap="x3">
        <Info aria-hidden="true" size={18} />
        <Text textStyle="t2Regular">
          아직 팀 매핑 전이에요. 팀 정보가 연결되면 회원 목록에서 팀을 확인할 수 있어요.
        </Text>
      </HStack>
    </Box>
  );
}
