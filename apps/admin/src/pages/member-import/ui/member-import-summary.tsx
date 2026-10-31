import type { Member } from '~/features/member-management';
import {
  classifyMemberImportRows,
  summarizeMemberImportRows,
  validateMemberImportRows,
} from '../model/import-rows';
import type { ParsedMemberImportFile } from '../model/import-file';
import { dropzoneDescription, status, summary } from './member-import-page.css';
import { Text } from '@seed-design/react';

type MemberImportSummaryProps = {
  result: ParsedMemberImportFile | null;
  members?: readonly Member[];
  currentGeneration?: number;
};

export function MemberImportSummary({
  result,
  members,
  currentGeneration,
}: MemberImportSummaryProps) {
  if (result === null) {
    return null;
  }

  const classifiedRows =
    members !== undefined && currentGeneration !== undefined
      ? classifyMemberImportRows(validateMemberImportRows(result.rows), members)
      : null;
  const importSummary = classifiedRows ? summarizeMemberImportRows(classifiedRows) : null;

  return (
    <output className={status} aria-live="polite">
      <Text as="strong">{result.fileName} 파일을 읽었어요.</Text>
      {importSummary !== null && currentGeneration !== undefined ? (
        <p className={summary}>
          <span>{currentGeneration}기 기준</span>
          <span>정상 {importSummary.normal}건</span>
          <span>오류 {importSummary.error}건</span>
          <span>중복 {importSummary.duplicate}건</span>
        </p>
      ) : (
        <Text as="p" className={dropzoneDescription}>
          파일 내용을 확인했어요. 실제 반영은 아직 지원하지 않아요.
        </Text>
      )}
    </output>
  );
}
