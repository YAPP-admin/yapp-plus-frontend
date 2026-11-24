/** 회원 상세·명단 매칭·승인·반려를 하나의 패널에서 처리합니다. */
import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Field, Portal, SidePanel, Text, TextField, VStack } from '@seed-design/react';
import type { MemberDetailResponse, RosterCandidateView } from '@yapp-plus/api/generated';
import { approveMutation, rejectMutation } from '@yapp-plus/api/generated';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import { FilterSelect } from '~/shared/ui/filter-select';
import {
  approvalPositionLabels,
  approvalPositionOptions,
  approvalRoleLabels,
  approvalRoleOptions,
  approvalTypeOptions,
  formatMembershipReviewDate,
  parseGenerationId,
  toMembershipReviewFailure,
  type ApprovalPosition,
  type ApprovalRole,
  type ApprovalType,
} from '../model/membership-review';
import {
  membershipDetailQueryOptions,
  pendingMembershipsQueryOptions,
  rosterCandidatesQueryOptions,
} from '../model/membership-review-queries';
import * as styles from './pending-members.css';

const positionSelectEmptyValue = '__UNSELECTED__' as const;
const positionSelectOptions = [positionSelectEmptyValue, ...approvalPositionOptions] as const;
type PositionSelectValue = (typeof positionSelectOptions)[number];
const positionSelectLabels: Record<PositionSelectValue, string> = {
  [positionSelectEmptyValue]: '선택해 주세요',
  ...approvalPositionLabels,
};

type MembershipReviewPanelProps = {
  memberId: number;
  onClose: () => void;
  onMissing: () => void;
  onConflict: () => void;
  onCompleted: (action: 'approve' | 'reject') => void;
};

export function MembershipReviewPanel({
  memberId,
  onClose,
  onMissing,
  onConflict,
  onCompleted,
}: MembershipReviewPanelProps) {
  const detailQuery = useQuery(membershipDetailQueryOptions(memberId));

  useEffect(() => {
    if (detailQuery.error && toMembershipReviewFailure(detailQuery.error).status === 404) {
      onMissing();
    }
  }, [detailQuery.error, onMissing]);

  let panelBody;
  if (detailQuery.isPending) {
    panelBody = (
      <SidePanel.Body className={styles.panelBody}>
        <output className={styles.loading}>회원 정보를 불러오는 중입니다.</output>
      </SidePanel.Body>
    );
  } else if (detailQuery.error) {
    panelBody = (
      <SidePanel.Body className={styles.panelBody}>
        <div role="alert">
          <p>{getDetailErrorMessage(detailQuery.error)}</p>
          <ActionButton type="button" variant="neutralWeak" onClick={onMissing}>
            목록으로 돌아가기
          </ActionButton>
        </div>
      </SidePanel.Body>
    );
  } else {
    panelBody = (
      <MembershipReviewContent
        memberId={memberId}
        detail={detailQuery.data}
        onClose={onClose}
        onConflict={onConflict}
        onCompleted={onCompleted}
      />
    );
  }

  return (
    <SidePanel.Root direction="right" open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <SidePanel.Backdrop />
        <SidePanel.Positioner>
          <SidePanel.Content className={styles.panel} data-seed-color-mode="dark-only">
            <SidePanel.Header>
              <SidePanel.Title>가입 심사 상세</SidePanel.Title>
              <SidePanel.Description>
                회원 정보를 확인하고 심사 결과를 처리해요.
              </SidePanel.Description>
              <SidePanel.CloseButton aria-label="가입 심사 상세 닫기">
                <X size={20} aria-hidden="true" />
              </SidePanel.CloseButton>
            </SidePanel.Header>
            {panelBody}
          </SidePanel.Content>
        </SidePanel.Positioner>
      </Portal>
    </SidePanel.Root>
  );
}

function MembershipReviewContent({
  memberId,
  detail,
  onClose,
  onConflict,
  onCompleted,
}: {
  memberId: number;
  detail: MemberDetailResponse;
  onClose: () => void;
  onConflict: () => void;
  onCompleted: (action: 'approve' | 'reject') => void;
}) {
  const queryClient = useQueryClient();
  const [approvalType, setApprovalType] = useState<ApprovalType>('ROSTER');
  const [generationInput, setGenerationInput] = useState(
    detail.memberships[0]?.generationId === undefined
      ? ''
      : String(detail.memberships[0].generationId),
  );
  const [selectedRosterEntryId, setSelectedRosterEntryId] = useState<number>();
  const [role, setRole] = useState<ApprovalRole>(detail.role ?? 'PLAYER');
  const [position, setPosition] = useState<PositionSelectValue>(
    getInitialPosition(detail) ?? positionSelectEmptyValue,
  );
  const [phoneNumber, setPhoneNumber] = useState(detail.phoneNumber ?? '');
  const [reason, setReason] = useState('');
  const [approvalAttempted, setApprovalAttempted] = useState(false);
  const [rejectionAttempted, setRejectionAttempted] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const generationId = parseGenerationId(generationInput);
  const listQuery = pendingMembershipsQueryOptions();
  const detailQuery = membershipDetailQueryOptions(memberId);
  const isApprovalValid =
    generationId !== undefined &&
    (approvalType === 'ROSTER'
      ? selectedRosterEntryId !== undefined
      : role !== undefined &&
        position !== positionSelectEmptyValue &&
        phoneNumber.trim().length > 0);

  async function invalidateReviewQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listQuery.queryKey }),
      queryClient.invalidateQueries({ queryKey: detailQuery.queryKey }),
    ]);
  }

  const approve = useMutation({
    ...approveMutation(),
    onSuccess: async () => {
      await invalidateReviewQueries();
      onCompleted('approve');
    },
    onError: async (error) => {
      const failure = toMembershipReviewFailure(error);
      if (failure.code === 'MEMBER_CONFLICT' || failure.status === 409) {
        await queryClient.invalidateQueries({ queryKey: listQuery.queryKey });
        onConflict();
        return;
      }
      setActionError(getSaveErrorMessage(error));
    },
  });

  const reject = useMutation({
    ...rejectMutation(),
    onSuccess: async () => {
      await invalidateReviewQueries();
      onCompleted('reject');
    },
    onError: async (error) => {
      const failure = toMembershipReviewFailure(error);
      if (failure.code === 'MEMBER_CONFLICT' || failure.status === 409) {
        await queryClient.invalidateQueries({ queryKey: listQuery.queryKey });
        onConflict();
        return;
      }
      setActionError(getSaveErrorMessage(error));
    },
  });

  const actionPending = approve.isPending || reject.isPending;

  function submitApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApprovalAttempted(true);
    setActionError(undefined);

    if (!isApprovalValid || generationId === undefined) {
      return;
    }

    approve.mutate({
      path: { memberId },
      body:
        approvalType === 'ROSTER'
          ? {
              approvalType,
              role,
              generationId,
              rosterEntryId: selectedRosterEntryId,
            }
          : {
              approvalType,
              role,
              generationId,
              position: position === positionSelectEmptyValue ? undefined : position,
              phoneNumber: phoneNumber.trim(),
            },
    });
  }

  function submitRejection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRejectionAttempted(true);
    setActionError(undefined);

    if (reason.trim().length === 0) {
      return;
    }

    reject.mutate({ path: { memberId }, body: { reason } });
  }

  return (
    <SidePanel.Body className={styles.panelBody}>
      <section className={styles.panelSection} aria-labelledby={`member-summary-${memberId}`}>
        <div className={styles.panelSectionHeader}>
          <h2 id={`member-summary-${memberId}`} className={styles.panelSectionTitle}>
            회원 정보
          </h2>
          <Badge variant="weak" tone="neutral">
            {detail.reviewStatus}
          </Badge>
        </div>
        <dl className={styles.summary}>
          <SummaryItem label="이름" value={detail.name ?? '-'} />
          <SummaryItem label="전화번호" value={detail.phoneNumber ?? '-'} />
          <SummaryItem label="가입일" value={formatMembershipReviewDate(detail.signedUpAt)} />
          <SummaryItem label="탈퇴 여부" value={detail.accountDeleted ? 'true' : 'false'} />
        </dl>
        {detail.rejectionReason ? (
          <Text as="p" textStyle="t1Regular" color="fg.neutralMuted">
            이전 반려 사유: {detail.rejectionReason}
          </Text>
        ) : null}
      </section>

      <MembershipHistory memberships={detail.memberships} />

      <section className={styles.panelSection} aria-labelledby={`approval-${memberId}`}>
        <h2 id={`approval-${memberId}`} className={styles.panelSectionTitle}>
          가입 승인
        </h2>
        <form
          className={styles.form}
          method="post"
          aria-labelledby={`approval-${memberId}`}
          onSubmit={submitApproval}
          noValidate
        >
          <fieldset className={styles.approvalTypes} disabled={actionPending}>
            <legend className={styles.visuallyHidden}>승인 방식</legend>
            {approvalTypeOptions.map((type) => (
              <label className={styles.approvalType} key={type}>
                <input
                  type="radio"
                  name={`approval-type-${memberId}`}
                  value={type}
                  checked={approvalType === type}
                  onChange={() => setApprovalType(type)}
                />
                {type}
              </label>
            ))}
          </fieldset>

          <fieldset className={styles.formFields} disabled={actionPending}>
            <legend className={styles.visuallyHidden}>승인 정보</legend>
            <Field.Root invalid={approvalAttempted && generationId === undefined}>
              <Field.Label>승인 기수</Field.Label>
              <TextField.Root
                value={generationInput}
                onValueChange={(value) => {
                  setGenerationInput(value);
                  setSelectedRosterEntryId(undefined);
                }}
              >
                <TextField.Input
                  name="generationId"
                  type="text"
                  inputMode="numeric"
                  required
                  onBlur={() => setApprovalAttempted(true)}
                />
              </TextField.Root>
              {approvalAttempted && generationId === undefined ? (
                <Field.ErrorMessage role="alert">승인 기수를 입력해 주세요.</Field.ErrorMessage>
              ) : null}
            </Field.Root>

            <FilterSelect
              label="역할"
              value={role}
              options={approvalRoleOptions}
              labels={approvalRoleLabels}
              onChange={setRole}
            />

            {approvalType === 'ROSTER' ? (
              <RosterCandidates
                memberId={memberId}
                generationId={generationId}
                selectedRosterEntryId={selectedRosterEntryId}
                onSelect={setSelectedRosterEntryId}
              />
            ) : (
              <>
                <FilterSelect
                  label="직군"
                  value={position}
                  options={positionSelectOptions}
                  labels={positionSelectLabels}
                  onChange={setPosition}
                />
                {approvalAttempted && position === positionSelectEmptyValue ? (
                  <p className={styles.feedback} role="alert">
                    직군을 선택해 주세요.
                  </p>
                ) : null}
                <Field.Root invalid={approvalAttempted && phoneNumber.trim().length === 0}>
                  <Field.Label>전화번호</Field.Label>
                  <TextField.Root value={phoneNumber} onValueChange={setPhoneNumber}>
                    <TextField.Input
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      onBlur={() => setApprovalAttempted(true)}
                    />
                  </TextField.Root>
                  {approvalAttempted && phoneNumber.trim().length === 0 ? (
                    <Field.ErrorMessage role="alert">전화번호를 입력해 주세요.</Field.ErrorMessage>
                  ) : null}
                </Field.Root>
              </>
            )}
          </fieldset>

          {approvalAttempted && approvalType === 'ROSTER' && selectedRosterEntryId === undefined ? (
            <p className={styles.feedback} role="alert">
              승인할 명단 후보를 선택해 주세요.
            </p>
          ) : null}
          <div className={styles.formActions}>
            <ActionButton
              type="button"
              variant="neutralWeak"
              disabled={actionPending}
              onClick={onClose}
            >
              닫기
            </ActionButton>
            <ActionButton type="submit" disabled={actionPending} loading={approve.isPending}>
              승인하기
            </ActionButton>
          </div>
        </form>
        {actionError ? (
          <p className={styles.feedback} role="alert">
            {actionError}
          </p>
        ) : null}
      </section>

      <div className={styles.divider} />

      <section className={styles.panelSection} aria-labelledby={`rejection-${memberId}`}>
        <h2 id={`rejection-${memberId}`} className={styles.panelSectionTitle}>
          가입 반려
        </h2>
        <form
          className={styles.form}
          method="post"
          aria-labelledby={`rejection-${memberId}`}
          onSubmit={submitRejection}
          noValidate
        >
          <Field.Root invalid={rejectionAttempted && reason.trim().length === 0}>
            <Field.Label>반려 사유</Field.Label>
            <Field.Description>
              현재는 최대 길이를 제한하지 않고 서버 검증을 따릅니다.
            </Field.Description>
            <TextField.Root value={reason} onValueChange={setReason}>
              <TextField.Textarea name="reason" required autoresize={false} />
            </TextField.Root>
            {rejectionAttempted && reason.trim().length === 0 ? (
              <Field.ErrorMessage role="alert">반려 사유를 입력해 주세요.</Field.ErrorMessage>
            ) : null}
          </Field.Root>
          <div className={styles.formActions}>
            <ActionButton
              type="submit"
              variant="criticalSolid"
              disabled={actionPending}
              loading={reject.isPending}
            >
              반려하기
            </ActionButton>
          </div>
        </form>
      </section>
    </SidePanel.Body>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryItem}>
      <dt className={styles.summaryLabel}>{label}</dt>
      <dd className={styles.summaryValue}>{value}</dd>
    </div>
  );
}

function MembershipHistory({ memberships }: { memberships: MemberDetailResponse['memberships'] }) {
  return (
    <section className={styles.panelSection} aria-labelledby="membership-history-title">
      <h2 id="membership-history-title" className={styles.panelSectionTitle}>
        과거 기수 활동
      </h2>
      {memberships.length === 0 ? (
        <Text as="p" textStyle="t1Regular" color="fg.neutralMuted">
          과거 기수 활동이 없어요.
        </Text>
      ) : (
        <section className={styles.historyRegion} aria-label="과거 기수 활동 표">
          <table className={styles.historyTable}>
            <caption className={styles.visuallyHidden}>과거 기수 활동 목록</caption>
            <thead>
              <tr>
                <th scope="col">기수</th>
                <th scope="col">가입 형태</th>
                <th scope="col">상태</th>
                <th scope="col">직군</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={`${membership.generationId}-${membership.joinedAs}-${membership.status}`}>
                  <td>{membership.generationId}</td>
                  <td>{membership.joinedAs}</td>
                  <td>{membership.status}</td>
                  <td>{membership.position ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
}

function RosterCandidates({
  memberId,
  generationId,
  selectedRosterEntryId,
  onSelect,
}: {
  memberId: number;
  generationId: number | undefined;
  selectedRosterEntryId: number | undefined;
  onSelect: (rosterEntryId: number) => void;
}) {
  if (generationId === undefined) {
    return (
      <Text as="p" textStyle="t1Regular" color="fg.neutralMuted">
        승인 기수를 입력하면 명단 매칭 후보를 조회할 수 있어요.
      </Text>
    );
  }

  return (
    <RosterCandidatesQuery
      memberId={memberId}
      generationId={generationId}
      selectedRosterEntryId={selectedRosterEntryId}
      onSelect={onSelect}
    />
  );
}

function RosterCandidatesQuery({
  memberId,
  generationId,
  selectedRosterEntryId,
  onSelect,
}: {
  memberId: number;
  generationId: number;
  selectedRosterEntryId: number | undefined;
  onSelect: (rosterEntryId: number) => void;
}) {
  const candidatesQuery = useQuery(rosterCandidatesQueryOptions(memberId, generationId));

  if (candidatesQuery.isPending) {
    return <output className={styles.loading}>명단 매칭 후보를 불러오는 중입니다.</output>;
  }

  if (candidatesQuery.error) {
    return (
      <p className={styles.feedback} role="alert">
        명단 매칭 후보를 불러오지 못했어요.
      </p>
    );
  }

  const candidates = candidatesQuery.data;
  if (candidates.length === 0) {
    return (
      <Text as="p" textStyle="t1Regular" color="fg.neutralMuted">
        일치하는 명단 매칭 후보가 없어요.
      </Text>
    );
  }

  return (
    <section aria-labelledby="roster-candidates-title">
      <VStack gap="x2">
        <Text as="h3" id="roster-candidates-title" textStyle="t3Bold">
          명단 매칭 후보
        </Text>
        <ul className={styles.candidateList}>
          {candidates.map((candidate) => (
            <CandidateItem
              key={candidate.rosterEntryId}
              candidate={candidate}
              selected={candidate.rosterEntryId === selectedRosterEntryId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </VStack>
    </section>
  );
}

function CandidateItem({
  candidate,
  selected,
  onSelect,
}: {
  candidate: RosterCandidateView;
  selected: boolean;
  onSelect: (rosterEntryId: number) => void;
}) {
  return (
    <li className={selected ? `${styles.candidate} ${styles.candidateSelected}` : styles.candidate}>
      <div className={styles.candidateInfo}>
        <Text textStyle="t2Bold">{candidate.name}</Text>
        <span className={styles.candidateMeta}>
          {candidate.phoneNumber} · {candidate.position ?? '-'} · {candidate.role ?? '-'}
        </span>
      </div>
      <ActionButton
        type="button"
        size="small"
        variant={selected ? 'neutralSolid' : 'neutralWeak'}
        aria-pressed={selected}
        onClick={() => onSelect(candidate.rosterEntryId)}
      >
        {selected ? '선택됨' : '선택'}
      </ActionButton>
    </li>
  );
}

function getInitialPosition(detail: MemberDetailResponse): ApprovalPosition | undefined {
  const position = detail.memberships.find((membership) => membership.position !== null)?.position;
  return position !== null && position !== undefined && position in approvalPositionLabels
    ? position
    : undefined;
}

function getDetailErrorMessage(error: unknown) {
  return toMembershipReviewFailure(error).status === 404
    ? '해당 가입 신청을 찾을 수 없어요. 목록을 새로고침해 주세요.'
    : '회원 정보를 불러오지 못했어요. 다시 시도해 주세요.';
}

function getSaveErrorMessage(error: unknown) {
  const failure = toMembershipReviewFailure(error);
  if (failure.status === 400) {
    return '입력값을 확인해 주세요.';
  }
  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }
  return '가입 심사를 처리하지 못했어요. 다시 시도해 주세요.';
}
