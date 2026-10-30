import { Field, TextField } from '@seed-design/react';
import { FilterSelect } from '~/shared/ui/filter-select';
import { memberPartSchema, partLabels, type MemberSearch } from '../model/member-search';
import * as styles from './members-page.css';

export function MemberFilters({
  search,
  onSearch,
  onFilterChange,
}: {
  search: MemberSearch;
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
}) {
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
    </div>
  );
}
