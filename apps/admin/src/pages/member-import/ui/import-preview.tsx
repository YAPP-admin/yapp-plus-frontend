import { useState } from 'react';
import { RadioGroup, RadioGroupField, Text } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { Member } from '~/features/member-management';
import type { ParsedMemberImportFile } from '../model/import-file';
import {
  classifyMemberImportRows,
  summarizeMemberImportRows,
  type ClassifiedMemberImportRow,
  type MemberImportDuplicateAction,
  validateMemberImportRows,
} from '../model/import-rows';
import {
  caption,
  cell,
  duplicateAction,
  duplicateActions,
  error,
  footer,
  headerCell,
  notice,
  planned,
  preview,
  rowHeader,
  status,
  summary,
  table,
  tableViewport,
} from './import-preview.css';

type ImportPreviewProps = {
  result: ParsedMemberImportFile | null;
  members?: readonly Member[];
  currentGeneration?: number;
};

const classificationLabels = {
  'new-member': '신규 회원',
  'new-generation': '새 기수',
} as const;

export function ImportPreview({ result, members, currentGeneration }: ImportPreviewProps) {
  const [duplicateSelections, setDuplicateSelections] = useState<
    Record<number, MemberImportDuplicateAction>
  >({});

  if (result === null) {
    return null;
  }

  if (members === undefined || currentGeneration === undefined) {
    return (
      <output className={status} aria-live="polite">
        <Text as="strong">{result.fileName} 파일을 읽었어요.</Text>
        <Text as="p">파일 내용을 확인했어요. 실제 반영은 아직 지원하지 않아요.</Text>
      </output>
    );
  }

  const rows = classifyMemberImportRows(validateMemberImportRows(result.rows), members);
  const importSummary = summarizeMemberImportRows(rows, duplicateSelections);

  return (
    <section className={preview} aria-labelledby="member-import-preview-heading">
      <output className={status} aria-live="polite">
        <Text as="strong" id="member-import-preview-heading">
          {result.fileName} 파일을 읽었어요.
        </Text>
        <p className={summary}>
          <span>전체 {importSummary.total}건</span>
          <span>정상 {importSummary.normal}건</span>
          <span>오류 {importSummary.error}건</span>
          <span>중복 {importSummary.duplicate}건</span>
          <span className={planned}>반영 예정 {importSummary.planned}건</span>
        </p>
      </output>

      <p className={notice}>
        {currentGeneration}기 예시 회원 명단을 기준으로 검토하고 있어요. 실제 반영 전 내용을 다시
        확인해 주세요.
      </p>

      <section className={tableViewport} aria-label="회원 명단 미리보기">
        <table className={table}>
          <caption className={caption}>CSV 회원 명단 검증 결과</caption>
          <thead>
            <tr>
              <th className={`${cell} ${headerCell}`} scope="col">
                원본 행
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                이름
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                전화번호
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                기수
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                직군
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                권한
              </th>
              <th className={`${cell} ${headerCell}`} scope="col">
                검토 결과
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ImportPreviewRow
                key={row.sourceRow}
                row={row}
                action={duplicateSelections[row.sourceRow] ?? 'skip'}
                onActionChange={(action) =>
                  setDuplicateSelections((previous) => ({
                    ...previous,
                    [row.sourceRow]: action,
                  }))
                }
              />
            ))}
          </tbody>
        </table>
      </section>

      <div className={footer}>
        <Text as="p" className={planned}>
          반영 예정 {importSummary.planned}건
        </Text>
        <ActionButton type="button" disabled>
          회원 명단 반영 준비 중
        </ActionButton>
      </div>
    </section>
  );
}

function ImportPreviewRow({
  row,
  action,
  onActionChange,
}: {
  row: ClassifiedMemberImportRow;
  action: MemberImportDuplicateAction;
  onActionChange: (action: MemberImportDuplicateAction) => void;
}) {
  return (
    <tr>
      <th className={`${cell} ${rowHeader}`} scope="row">
        {row.sourceRow}행
      </th>
      {Array.from({ length: 5 }, (_, index) => (
        <td className={cell} key={`${row.sourceRow}-${index}`}>
          {displayCellValue(row.values[index])}
        </td>
      ))}
      <td className={cell}>{renderReviewCell(row, action, onActionChange)}</td>
    </tr>
  );
}

function renderReviewCell(
  row: ClassifiedMemberImportRow,
  action: MemberImportDuplicateAction,
  onActionChange: (action: MemberImportDuplicateAction) => void,
) {
  if (row.status === 'error') {
    return (
      <span className={error}>
        오류: {row.error.message}
        {row.error.duplicateSourceRow !== undefined &&
          ` (${row.error.duplicateSourceRow}행과 중복)`}
      </span>
    );
  }

  if (row.status === 'normal') {
    return classificationLabels[row.classification];
  }

  return (
    <RadioGroupField.Root
      name={`member-import-duplicate-${row.sourceRow}`}
      aria-label={`${row.sourceRow}행 ${row.name} 중복 처리`}
      value={action}
      onValueChange={(value) => {
        if (value === 'skip' || value === 'overwrite') {
          onActionChange(value);
        }
      }}
    >
      <RadioGroup.Root className={duplicateActions}>
        <RadioGroup.Item value="skip" className={duplicateAction}>
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemControl>
            <RadioGroup.ItemIndicator />
          </RadioGroup.ItemControl>
          <RadioGroup.ItemLabel>건너뛰기</RadioGroup.ItemLabel>
        </RadioGroup.Item>
        <RadioGroup.Item value="overwrite" className={duplicateAction}>
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemControl>
            <RadioGroup.ItemIndicator />
          </RadioGroup.ItemControl>
          <RadioGroup.ItemLabel>덮어쓰기</RadioGroup.ItemLabel>
        </RadioGroup.Item>
      </RadioGroup.Root>
    </RadioGroupField.Root>
  );
}

function displayCellValue(value: string | undefined) {
  return value === undefined || value === '' ? '—' : value;
}
