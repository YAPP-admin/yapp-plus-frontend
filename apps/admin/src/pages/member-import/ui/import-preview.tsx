import { useState, type FormEvent } from 'react';
import { Dialog, Portal, RadioGroup, RadioGroupField, Text } from '@seed-design/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { list8InfiniteQueryKey, register2Mutation } from '@yapp-plus/api/generated';
import { ActionButton } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import type { Member } from '~/features/member-management';
import type { ParsedMemberImportFile } from '../model/import-file';
import { MAX_IMPORT_ROWS } from '../model/import-file';
import {
  classifyMemberImportRows,
  classifyMemberImportRowsByRosterEntries,
  summarizeMemberImportRows,
  type ClassifiedMemberImportRow,
  type MemberImportDuplicateAction,
  validateMemberImportRows,
} from '../model/import-rows';
import { buildMemberImportRegistrationRequest } from '../model/import-registration';
import { useMemberImportRosterQuery } from '../model/use-member-import-roster-query';
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
  generationId?: number;
  members?: readonly Member[];
  currentGeneration?: number;
};

const classificationLabels = {
  'new-member': '신규 회원',
  'new-generation': '새 기수',
} as const;

/** CSV 결과에 맞는 사전 명단 조회 경로를 선택한다. */
export function ImportPreview({
  result,
  generationId,
  members,
  currentGeneration,
}: ImportPreviewProps) {
  const [duplicateSelections, setDuplicateSelections] = useState<
    Record<number, MemberImportDuplicateAction>
  >({});

  if (result === null) {
    return null;
  }

  if (members !== undefined && currentGeneration !== undefined) {
    const rows = classifyMemberImportRows(validateMemberImportRows(result.rows), members);
    return (
      <ImportPreviewContent
        result={result}
        rows={rows}
        duplicateSelections={duplicateSelections}
        onDuplicateActionChange={(sourceRow, action) =>
          setDuplicateSelections((previous) => ({ ...previous, [sourceRow]: action }))
        }
        noticeText={`${currentGeneration}기 예시 회원 명단을 기준으로 검토하고 있어요. 실제 반영 전 내용을 다시 확인해 주세요.`}
      />
    );
  }

  if (generationId === undefined || currentGeneration === undefined) {
    return (
      <output className={status} aria-live="polite">
        <Text as="strong">{result.fileName} 파일을 읽었어요.</Text>
        <Text as="p">파일 내용을 확인했어요. 사전 명단 조회를 준비 중이에요.</Text>
      </output>
    );
  }

  return (
    <ApiImportPreview
      result={result}
      generationId={generationId}
      currentGeneration={currentGeneration}
      duplicateSelections={duplicateSelections}
      onDuplicateActionChange={(sourceRow, action) =>
        setDuplicateSelections((previous) => ({ ...previous, [sourceRow]: action }))
      }
    />
  );
}

/** 파일 검증이 끝난 뒤 현재 기수 사전 명단을 조회하고 중복을 분류한다. */
function ApiImportPreview({
  result,
  generationId,
  currentGeneration,
  duplicateSelections,
  onDuplicateActionChange,
}: {
  result: ParsedMemberImportFile;
  generationId: number;
  currentGeneration: number;
  duplicateSelections: Readonly<Record<number, MemberImportDuplicateAction>>;
  onDuplicateActionChange: (sourceRow: number, action: MemberImportDuplicateAction) => void;
}) {
  const validatedRows = validateMemberImportRows(result.rows);
  const isValid = validatedRows.length > 0 && validatedRows.every((row) => row.status === 'valid');
  const hasGenerationMismatch = validatedRows.some(
    (row) => row.status === 'valid' && row.generation !== currentGeneration,
  );
  const hasTooManyRows = validatedRows.length > MAX_IMPORT_ROWS;
  const canFetchRoster = isValid && !hasGenerationMismatch && !hasTooManyRows;
  const query = useMemberImportRosterQuery({ generationId, enabled: canFetchRoster });
  const queryClient = useQueryClient();
  const registration = useMutation({
    ...register2Mutation(),
    onSuccess: () => {
      // 완료 안내를 유지하고 조회 화면 진입 시 최신 명단을 가져옵니다.
      void queryClient.invalidateQueries({
        queryKey: list8InfiniteQueryKey({ path: { generationId } }),
        refetchType: 'none',
      });
    },
  });
  const navigate = useNavigate();

  if (registration.isSuccess) {
    return (
      <MemberImportSuccessDialog
        result={registration.data}
        onClose={() => void navigate({ to: '/members/roster', search: {} })}
      />
    );
  }

  if (canFetchRoster && query.isFetchingAllPages) {
    return (
      <output className={status} aria-live="polite">
        <Text as="strong">{result.fileName} 파일을 읽었어요.</Text>
        <Text as="p">현재 기수의 기존 사전 명단을 확인하고 있어요.</Text>
      </output>
    );
  }

  if (canFetchRoster && query.isError) {
    return (
      <output className={status} aria-live="assertive">
        <Text as="strong">사전 명단을 확인하지 못했어요.</Text>
        <Text as="p">네트워크 상태를 확인한 뒤 다시 시도해 주세요.</Text>
        <ActionButton type="button" onClick={() => void query.refetch()}>
          다시 시도
        </ActionButton>
      </output>
    );
  }

  const rows = canFetchRoster
    ? classifyMemberImportRowsByRosterEntries(validatedRows, query.rosterEntries)
    : classifyMemberImportRowsByRosterEntries(validatedRows, []);
  const blockingNotice = getBlockingNotice({
    hasGenerationMismatch,
    hasTooManyRows,
    isValid,
    currentGeneration,
  });
  const handleRegister = () => {
    const body = buildMemberImportRegistrationRequest({
      generationId,
      rows,
      duplicateSelections,
    });
    registration.mutate({ path: { generationId }, body });
  };

  return (
    <>
      <ImportPreviewContent
        result={result}
        rows={rows}
        duplicateSelections={duplicateSelections}
        onDuplicateActionChange={onDuplicateActionChange}
        noticeText={
          blockingNotice ?? `${currentGeneration}기 사전 명단을 기준으로 검토하고 있어요.`
        }
        onSubmit={handleRegister}
        isSubmitting={registration.isPending}
        submitError={registration.isError ? '잠시 후 다시 시도해 주세요.' : undefined}
      />
    </>
  );
}

/** 파일 검증 결과에 따라 사전 명단 조회를 막은 이유를 사용자에게 안내한다. */
function getBlockingNotice({
  hasGenerationMismatch,
  hasTooManyRows,
  isValid,
  currentGeneration,
}: {
  hasGenerationMismatch: boolean;
  hasTooManyRows: boolean;
  isValid: boolean;
  currentGeneration: number;
}) {
  if (hasGenerationMismatch) {
    return `현재 선택된 ${currentGeneration}기와 다른 기수의 행이 있어요. CSV의 기수를 확인해 주세요.`;
  }
  if (hasTooManyRows) {
    return `한 번에 ${MAX_IMPORT_ROWS.toLocaleString()}건까지 등록할 수 있어요.`;
  }
  if (!isValid) {
    return '파일 오류를 수정하면 현재 기수의 기존 사전 명단과 중복을 확인할 수 있어요.';
  }
  return undefined;
}

/** 검증·중복 분류 결과를 표와 반영 예정 집계로 표시한다. */
function ImportPreviewContent({
  result,
  rows,
  duplicateSelections,
  onDuplicateActionChange,
  noticeText,
  onSubmit,
  isSubmitting = false,
  submitError,
}: {
  result: ParsedMemberImportFile;
  rows: readonly ClassifiedMemberImportRow[];
  duplicateSelections: Readonly<Record<number, MemberImportDuplicateAction>>;
  onDuplicateActionChange: (sourceRow: number, action: MemberImportDuplicateAction) => void;
  noticeText: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}) {
  const importSummary = summarizeMemberImportRows(rows, duplicateSelections);
  const canSubmit = onSubmit !== undefined && importSummary.planned > 0;
  let submitLabel = '반영할 회원 없음';
  if (isSubmitting) {
    submitLabel = '회원 명단 반영 중';
  } else if (onSubmit === undefined) {
    submitLabel = '회원 명단 반영 준비 중';
  } else if (canSubmit) {
    submitLabel = '회원 명단 반영';
  }

  /** 검증된 CSV만 반영 요청으로 넘기고 브라우저 기본 제출은 막는다. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || onSubmit === undefined || isSubmitting) {
      return;
    }
    onSubmit();
  }

  return (
    <form
      className={preview}
      aria-labelledby="member-import-preview-heading"
      onSubmit={handleSubmit}
    >
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

      <p className={notice}>{noticeText}</p>

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
                onActionChange={(action) => onDuplicateActionChange(row.sourceRow, action)}
              />
            ))}
          </tbody>
        </table>
      </section>

      <div className={footer}>
        <Text as="p" className={planned}>
          반영 예정 {importSummary.planned}건
        </Text>
        <ActionButton type="submit" disabled={!canSubmit || isSubmitting} loading={isSubmitting}>
          {submitLabel}
        </ActionButton>
      </div>
      {submitError ? (
        <output className={status} aria-live="assertive">
          <Text as="strong">명단을 반영하지 못했어요.</Text>
          <Text as="p">{submitError}</Text>
        </output>
      ) : null}
    </form>
  );
}

/** 사전 명단 등록 성공 결과를 안내하고 업로드 명단으로 이동한다. */
function MemberImportSuccessDialog({
  result,
  onClose,
}: {
  result: { createdCount?: number; updatedCount?: number; unchangedCount?: number };
  onClose: () => void;
}) {
  const details = [
    result.createdCount === undefined ? null : `신규 ${result.createdCount}건`,
    result.updatedCount === undefined ? null : `수정 ${result.updatedCount}건`,
    result.unchangedCount === undefined ? null : `변경 없음 ${result.unchangedCount}건`,
  ].filter((detail): detail is string => detail !== null);

  return (
    <Dialog.Root
      open
      closeOnInteractOutside={false}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>명단 등록이 완료됐어요.</Dialog.Title>
              <Dialog.Description>업로드 명단에서 반영된 내용을 확인해 주세요.</Dialog.Description>
              <Dialog.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <Dialog.Body>
              {details.length > 0 ? <Text as="p">{details.join(' · ')}</Text> : null}
            </Dialog.Body>
            <Dialog.Footer>
              <ActionButton type="button" onClick={onClose}>
                업로드 명단으로 이동
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

/** 한 행의 값과 검토 결과를 표에 표시한다. */
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

/** 행 상태에 맞는 오류 문구·분류명·중복 처리 선택지를 반환한다. */
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

/** 비어 있거나 표시할 수 없는 값을 읽기 쉬운 기호로 대체한다. */
function displayCellValue(value: string | undefined) {
  return value === undefined || value === '' ? '—' : value;
}
