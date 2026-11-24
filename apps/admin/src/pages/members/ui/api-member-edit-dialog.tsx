import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, HStack, Portal, Text, VStack } from '@seed-design/react';
import type { AdminMemberDetailResponse } from '@yapp-plus/api/generated';
import { correctMutation } from '@yapp-plus/api/generated';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import { FilterSelect } from '~/shared/ui/filter-select';
import type { MemberSearch } from '../model/member-search';
import {
  getMemberApiErrorMessage,
  memberPositionLabels,
  memberPositionOptions,
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

type ApiMemberEditDialogProps = {
  generationId: number;
  search: MemberSearch;
  memberId: number;
  onClose: () => void;
  onSaved: () => void;
};

export function ApiMemberEditDialog({
  generationId,
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
              <Dialog.Title>회원 정보 수정</Dialog.Title>
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
  search,
  onClose,
  onSaved,
}: {
  detail: AdminMemberDetailResponse;
  generationId: number;
  search: MemberSearch;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [position, setPosition] = useState<PositionValue>(detail.position ?? noPositionValue);
  const [status, setStatus] = useState<AdminMemberDetailResponse['status']>(detail.status);
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
    save.mutate({
      path: { generationId, memberId: detail.memberId },
      body: {
        position: position === noPositionValue ? null : position,
        status,
        expectedRevision: detail.revision,
      },
    });
  }

  return (
    <Dialog.Body className={dialogStyles.body}>
      <form className={styles.form} aria-label="회원 정보 수정" noValidate onSubmit={submit}>
        <VStack gap="x2">
          <HStack gap="x2" flexWrap="wrap">
            <Text as="h2" textStyle="t4Bold">
              {detail.name}
            </Text>
            <Badge variant="weak" tone="neutral">
              회원 ID {detail.memberId}
            </Badge>
          </HStack>
          <Text color="fg.neutralMuted">{detail.phoneNumber ?? '전화번호 미제공'}</Text>
        </VStack>

        <fieldset className={styles.fields} disabled={save.isPending || isWithdrawn}>
          <legend className={styles.historyMeta}>서버 API 제공 필드</legend>
          <FilterSelect
            label="직군"
            value={position}
            options={positionOptions}
            labels={positionLabels}
            onChange={setPosition}
          />
          <FilterSelect
            label="상태"
            value={status}
            options={statusOptions}
            labels={memberStatusLabels}
            onChange={setStatus}
          />
        </fieldset>

        <section className={styles.section} aria-labelledby={`member-history-${detail.memberId}`}>
          <VStack gap="x2">
            <Text as="h2" id={`member-history-${detail.memberId}`} textStyle="t5Bold">
              변경 이력
            </Text>
            {detail.changes.length > 0 ? (
              detail.changes.map((change) => (
                <div className={styles.historyItem} key={`${change.changedAt}-${change.field}`}>
                  <Text>{`${change.field}: ${change.before ?? '없음'} → ${change.after ?? '없음'}`}</Text>
                  <Text className={styles.historyMeta}>
                    {`${change.changedByStaffId}번 운영진 · ${new Date(change.changedAt).toLocaleDateString('ko-KR')}`}
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
            variant="neutralWeak"
            disabled={save.isPending}
            onClick={onClose}
          >
            취소
          </ActionButton>
          <ActionButton type="submit" disabled={isWithdrawn} loading={save.isPending}>
            저장
          </ActionButton>
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
      search={search}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
