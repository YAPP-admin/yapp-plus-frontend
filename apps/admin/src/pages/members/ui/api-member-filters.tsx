import { Field, TextField } from '@seed-design/react';
import { FilterSelect } from '~/shared/ui/filter-select';
import { memberPartSchema, partLabels, type MemberSearch } from '../model/member-search';
import * as styles from './members-page.css';

const allTeamValue = '__ALL_TEAMS__';

type TeamOption = {
  teamId: number;
  name: string;
  playerMemberCount: number;
};

export function ApiMemberFilters({
  search,
  teams,
  onSearch,
  onFilterChange,
}: {
  search: MemberSearch;
  teams: readonly TeamOption[];
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
}) {
  const teamOptions = [allTeamValue, ...teams.map((team) => String(team.teamId))];
  const teamLabels: Record<string, string> = {
    [allTeamValue]: `전체 팀 · ${teams.reduce((total, team) => total + team.playerMemberCount, 0)}명`,
  };
  for (const team of teams) {
    teamLabels[String(team.teamId)] = `${team.name} · ${team.playerMemberCount}명`;
  }

  return (
    <div className={styles.filters}>
      <Field.Root>
        <Field.Header>
          <Field.Label>이름 검색</Field.Label>
        </Field.Header>
        <TextField.Root value={search.q} onValueChange={onSearch} size="large">
          <TextField.Input type="search" name="q" autoComplete="off" />
        </TextField.Root>
      </Field.Root>
      <FilterSelect
        label="직군"
        value={search.part}
        options={memberPartSchema.options}
        labels={partLabels}
        onChange={(part) => onFilterChange({ part })}
      />
      <FilterSelect
        label="팀"
        value={search.team ?? allTeamValue}
        options={teamOptions}
        labels={teamLabels}
        onChange={(team) => onFilterChange({ team: team === allTeamValue ? undefined : team })}
      />
    </div>
  );
}
