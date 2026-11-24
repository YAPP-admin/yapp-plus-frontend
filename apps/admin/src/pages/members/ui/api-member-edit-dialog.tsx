import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, Field, HStack, Portal, Text, TextField, VStack } from '@seed-design/react';
import type {
  AdminGenerationListItemResponse,
  AdminMemberDetailResponse,
  AdminMemberUpdateRequest,
} from '@yapp-plus/api/generated';
import { correctMutation } from '@yapp-plus/api/generated';
import { ActionButton } from '@yapp-plus/ui';
import { ChevronUp, History, X } from 'lucide-react';
import { FilterSelect } from '~/shared/ui/filter-select';
import type { MemberSearch } from '../model/member-search';
import {
  getMemberApiErrorMessage,
  memberPositionLabels,
  memberPositionOptions,
  type MemberStatus,
  memberStatusLabels,
  memberStatusOptions,
  toMemberApiFailure,
} from '../model/member-api';
import {
  memberDetailQueryOptions,
  memberListQueryOptions,
  memberTeamOptionsQueryOptions,
} from '../model/member-api-queries';
import * as styles from './member-edit-form.css';
import * as dialogStyles from './member-edit-dialog.css';

const noPositionValue = '__NO_POSITION__' as const;
const positionOptions = [noPositionValue, ...memberPositionOptions] as const;
type PositionValue = (typeof positionOptions)[number];
const positionLabels: Record<PositionValue, string> = {
  [noPositionValue]: '직군 미지정',
  ...memberPositionLabels,
};

const memberChangeFieldLabels: Record<string, string> = {
  name: '이름',
  generationId: '기수',
  position: '직군',
  status: '권한',
};

type ApiMemberEditDialogProps = {
  generationId: number;
  generationNumber: number;
  generations: readonly AdminGenerationListItemResponse[];
  search: MemberSearch;
  memberId: number;
  onClose: () => void;
  onSaved: () => void;
};

export function ApiMemberEditDialog({
  generationId,
  generationNumber,
  generations,
  search,
  memberId,
  onClose,
  onSaved,
}: ApiMemberEditDialogProps) {
  const detailQuery = useQuery(memberDetailQueryOptions(generationId, memberId));

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={dialogStyles.dialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <VStack gap="x1">
                <Text className={dialogStyles.eyebrow}>EDIT MEMBER</Text>
                <Dialog.Title>회원 정보 수정</Dialog.Title>
              </VStack>
              <Dialog.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            {renderDetailContent({
              isPending: detailQuery.isPending,
              error: detailQuery.error,
              isFetching: detailQuery.isFetching,
              refetch: detailQuery.refetch,
              detail: detailQuery.data,
              generationId,
              generationNumber,
              generations,
              search,
              onClose,
              onSaved,
            })}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function ApiMemberEditContent({
  detail,
  generationId,
  generationNumber,
  generations,
  search,
  onClose,
  onSaved,
}: {
  detail: AdminMemberDetailResponse;
  generationId: number;
  generationNumber: number;
  generations: readonly AdminGenerationListItemResponse[];
  search: MemberSearch;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const generationValues = generations.map((generation) => String(generation.generationId));
  const generationLabels = Object.fromEntries(
    generations.map((generation) => [
      String(generation.generationId),
      String(generation.generationNumber),
    ]),
  ) as Record<string, string>;
  const currentGenerationValue = String(generationId);
  if (generationValues.length === 0) {
    generationValues.push(currentGenerationValue);
  }
  generationLabels[currentGenerationValue] ??= String(generationNumber);

  const [name, setName] = useState(detail.name);
  const [selectedGenerationId, setSelectedGenerationId] = useState(currentGenerationValue);
  const [position, setPosition] = useState<PositionValue>(detail.position ?? noPositionValue);
  const [status, setStatus] = useState<MemberStatus | 'WITHDRAWN'>(detail.status);
  const [submitError, setSubmitError] = useState<string>();
  const save = useMutation({
    ...correctMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: memberListQueryOptions(generationId, search).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: memberDetailQueryOptions(generationId, detail.memberId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: memberTeamOptionsQueryOptions(generationId).queryKey,
      });
      onSaved();
    },
    onError: (error) => {
      setSubmitError(getMemberApiErrorMessage(error, 'save'));
      if (toMemberApiFailure(error).status === 409) {
        void queryClient.invalidateQueries({
          queryKey: memberDetailQueryOptions(generationId, detail.memberId).queryKey,
        });
      }
    },
  });

  const isWithdrawn = detail.status === 'WITHDRAWN';
  const statusOptions = isWithdrawn ? (['WITHDRAWN'] as const) : memberStatusOptions;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);
    if (isWithdrawn) {
      setSubmitError('탈퇴한 회원은 정정할 수 없어요.');
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setSubmitError('이름을 입력해 주세요.');
      return;
    }

    const body = Object.assign(
      {
        position: position === noPositionValue ? null : position,
        // STAFF는 최신 백엔드 enum이지만 생성 SDK에는 아직 반영되지 않았습니다.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- OpenAPI 생성물 갱신 전까지 API 경계를 임시 호환한다.
        status: status as AdminMemberUpdateRequest['status'],
        expectedRevision: detail.revision,
      },
      {
        name: trimmedName,
        generationId: Number(selectedGenerationId),
      },
    );

    save.mutate({
      path: { generationId, memberId: detail.memberId },
      body,
    });
  }

  return (
    <Dialog.Body className={dialogStyles.body}>
      <form className={styles.form} aria-label="회원 정보 수정" noValidate onSubmit={submit}>
        <fieldset className={styles.fields} disabled={save.isPending || isWithdrawn}>
          <Field.Root className={styles.spanTwo}>
            <Field.Header>
              <Field.Label>이름</Field.Label>
            </Field.Header>
            <TextField.Root value={name} onValueChange={setName} size="large">
              <TextField.Input name="name" autoComplete="name" />
            </TextField.Root>
          </Field.Root>
          <FilterSelect
            label="기수"
            value={selectedGenerationId}
            options={generationValues}
            labels={generationLabels}
            onChange={setSelectedGenerationId}
          />
          <FilterSelect
            label="직군"
            value={position}
            options={positionOptions}
            labels={positionLabels}
            onChange={setPosition}
          />
          <FilterSelect
            className={styles.spanTwo}
            label="권한"
            value={status}
            options={statusOptions}
            labels={memberStatusLabels}
            onChange={setStatus}
          />
        </fieldset>

        <section className={styles.section} aria-labelledby={`member-history-${detail.memberId}`}>
          <VStack gap="x2">
            <div className={styles.historyHeader}>
              <HStack gap="x2" alignItems="center">
                <History aria-hidden="true" size={13} />
                <Text as="h2" id={`member-history-${detail.memberId}`} textStyle="t5Bold">
                  변경 이력
                </Text>
              </HStack>
              <ChevronUp aria-hidden="true" size={13} />
            </div>
            {detail.changes.length > 0 ? (
              detail.changes.map((change) => (
                <div className={styles.historyItem} key={`${change.changedAt}-${change.field}`}>
                  <Text className={styles.historyMeta}>
                    {new Date(change.changedAt).toLocaleString('ko-KR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </Text>
                  <Text className={styles.historyChange}>
                    {`${change.changedByStaffId}번 운영진 · ${memberChangeFieldLabels[change.field] ?? change.field} `}
                    <strong>{change.before ?? '없음'}</strong> →{' '}
                    <strong className={styles.historyAfter}>{change.after ?? '없음'}</strong>
                  </Text>
                </div>
              ))
            ) : (
              <Text className={styles.historyMeta}>변경 이력이 없어요.</Text>
            )}
          </VStack>
        </section>

        {isWithdrawn ? (
          <Text className={styles.notice} role="note">
            탈퇴한 회원은 서버 정책상 정정할 수 없어요.
          </Text>
        ) : null}
        {submitError ? (
          <Text className={styles.notice} role="alert" color="fg.critical">
            {submitError}
          </Text>
        ) : null}
        <div className={styles.actions}>
          <ActionButton
            type="button"
            variant="ghost"
            className={styles.inactiveAction}
            disabled
            aria-label="비활동 처리 (준비 중)"
          >
            비활동 처리
          </ActionButton>
          <div className={styles.actionGroup}>
            <ActionButton
              type="button"
              variant="neutralWeak"
              disabled={save.isPending}
              onClick={onClose}
            >
              취소
            </ActionButton>
            <ActionButton type="submit" disabled={isWithdrawn} loading={save.isPending}>
              저장하기
            </ActionButton>
          </div>
        </div>
        {toMemberApiFailure(save.error).status === 409 ? (
          <Text className={styles.notice} role="note">
            최신 상세를 다시 조회했어요. 현재 값을 확인하고 저장해 주세요.
          </Text>
        ) : null}
      </form>
    </Dialog.Body>
  );
}

function renderDetailContent({
  isPending,
  error,
  isFetching,
  refetch,
  detail,
  generationId,
  generationNumber,
  generations,
  search,
  onClose,
  onSaved,
}: {
  isPending: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
  detail: AdminMemberDetailResponse | undefined;
  generationId: number;
  generationNumber: number;
  generations: readonly AdminGenerationListItemResponse[];
  search: MemberSearch;
  onClose: () => void;
  onSaved: () => void;
}): ReactNode {
  if (isPending) {
    return (
      <Dialog.Body className={dialogStyles.body}>
        <output className={styles.notice}>회원 정보를 불러오는 중입니다.</output>
      </Dialog.Body>
    );
  }
  if (error !== null && error !== undefined) {
    return (
      <Dialog.Body className={dialogStyles.body}>
        <VStack gap="x3">
          <Text role="alert">{getMemberApiErrorMessage(error, 'detail')}</Text>
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={isFetching}
            onClick={() => void refetch()}
          >
            다시 시도
          </ActionButton>
        </VStack>
      </Dialog.Body>
    );
  }
  if (detail === undefined) {
    return null;
  }
  return (
    <ApiMemberEditContent
      detail={detail}
      generationId={generationId}
      generationNumber={generationNumber}
      generations={generations}
      search={search}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
