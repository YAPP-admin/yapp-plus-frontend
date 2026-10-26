/** 전체 대상 회원을 표시하고 헤더 이벤트로 클라이언트 정렬을 전환한다. */
import { useState, type ReactNode, type MouseEventHandler } from 'react';
import { flexRender, useTable, type SortingState } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { readerColumns, readerFeatures, type NoticeReader } from './notice-reader-columns';
import * as styles from './notice-readers.css';

const sortPresentation = {
  asc: { Icon: ArrowUp, ariaSort: 'ascending' },
  desc: { Icon: ArrowDown, ariaSort: 'descending' },
  none: { Icon: ArrowUpDown, ariaSort: 'none' },
} as const;

/** 정렬 해제 시 전달받은 도메인 기본 순서로 돌아가며 동률은 그 순서를 유지한다. */
export function NoticeReaders({ readers }: { readers: NoticeReader[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useTable({
    features: readerFeatures,
    data: readers,
    columns: readerColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.member.id,
    enableMultiSort: false,
    sortDescFirst: false,
  });

  if (!readers.length) {
    return <p>대상 회원이 없습니다.</p>;
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 좁은 화면에서 키보드로 표를 가로 스크롤하는 진입점이다.
    <section className={styles.scroll} aria-label="읽음 현황 표" tabIndex={0}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          전체 대상 {readers.length}명 · 헤더를 선택하면 오름차순, 내림차순, 기본 순서로 전환됩니다.
        </caption>

        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <NoticeReaderHeader
                  key={header.id}
                  label={flexRender(header.column.columnDef.header, header.getContext())}
                  sort={header.column.getIsSorted() || 'none'}
                  onSort={header.column.getToggleSortingHandler()}
                />
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <NoticeReaderRow
              key={row.id}
              cells={row.getAllCells().map((cell) => ({
                id: cell.id,
                content: flexRender(cell.column.columnDef.cell, cell.getContext()),
              }))}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** 가변 column 객체 대신 렌더링 시점의 정렬 상태와 이벤트를 받아 표시한다. */
function NoticeReaderHeader({
  label,
  sort,
  onSort,
}: {
  label: ReactNode;
  sort: keyof typeof sortPresentation;
  onSort: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  const { Icon, ariaSort } = sortPresentation[sort];

  return (
    <th className={styles.cell} scope="col" aria-sort={ariaSort}>
      <ActionButton variant="ghost" size="small" onClick={onSort}>
        {label}
        <Icon size={14} aria-hidden="true" />
      </ActionButton>
    </th>
  );
}

/** 정렬된 행의 표시 결과만 받아 테이블 인스턴스에 의존하지 않는다. */
function NoticeReaderRow({ cells }: { cells: { id: string; content: ReactNode }[] }) {
  return (
    <tr>
      {cells.map((cell) => (
        <td key={cell.id} className={styles.cell}>
          {cell.content}
        </td>
      ))}
    </tr>
  );
}
