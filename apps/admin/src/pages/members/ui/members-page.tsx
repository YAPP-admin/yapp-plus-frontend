import { Link } from '@tanstack/react-router';
import {
  memberPartSchema,
  memberRoleSchema,
  memberStatusSchema,
  partLabels,
  roleLabels,
  statusLabels,
  type MemberSearch,
} from '../model/member-search';
import { ActionButton } from '@yapp-plus/ui';
import * as styles from './members-page.css';

function Filter<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <label className={styles.field}>
      {label}
      <select
        className={styles.control}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option === event.currentTarget.value);
          if (next !== undefined) {
            onChange(next);
          }
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MembersPage({
  search,
  onFilterChange,
  onSearch,
}: {
  search: MemberSearch;
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>회원 관리</h1>
        <Link className={styles.tab} to="/members/import" search={{}}>
          명단 업로드
        </Link>
      </div>
      <nav className={styles.tabs} aria-label="회원 목록 구분">
        <Link
          className={styles.tab}
          from="/members/"
          to="/members"
          search={(previous) => ({ ...previous, tab: 'all' })}
          resetScroll={false}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          전체 회원
        </Link>
        <Link
          className={styles.tab}
          from="/members/"
          to="/members"
          search={(previous) => ({ ...previous, tab: 'pending' })}
          resetScroll={false}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          가입 대기
        </Link>
      </nav>
      <div className={styles.filters}>
        <form
          key={JSON.stringify(search)}
          className={styles.searchForm}
          onSubmit={(event) => {
            event.preventDefault();

            const query = new FormData(event.currentTarget).get('q');
            if (typeof query === 'string') {
              onSearch(query);
            }
          }}
        >
          <label className={styles.field}>
            이름 검색
            <input
              className={styles.control}
              type="search"
              name="q"
              autoComplete="off"
              defaultValue={search.q}
            />
          </label>
          <ActionButton className={styles.searchButton} type="submit">
            검색
          </ActionButton>
        </form>
        <Filter
          label="직군"
          value={search.part}
          options={memberPartSchema.options}
          labels={partLabels}
          onChange={(part) => onFilterChange({ part })}
        />
        <Filter
          label="권한"
          value={search.role}
          options={memberRoleSchema.options}
          labels={roleLabels}
          onChange={(role) => onFilterChange({ role })}
        />
        <Filter
          label="상태"
          value={search.status}
          options={memberStatusSchema.options}
          labels={statusLabels}
          onChange={(status) => onFilterChange({ status })}
        />
      </div>
      <p className={styles.placeholder}>
        {search.tab === 'pending'
          ? '가입 대기 목록을 준비 중입니다.'
          : '회원 목록을 준비 중입니다.'}
      </p>
    </main>
  );
}
