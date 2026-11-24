/** 가입 신청의 명단 매칭·신규 등록·거절 흐름을 Dialog로 처리합니다. */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, Field, Portal, TextField } from '@seed-design/react';
import type {
  AdminGenerationListItemResponse,
  MemberDetailResponse,
  RosterCandidateView,
} from '@yapp-plus/api/generated';
import { approveMutation, rejectMutation } from '@yapp-plus/api/generated';
import { ActionButton } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import { useOptionalAdminGeneration } from '~/features/admin-generation';
import { FilterSelect } from '~/shared/ui/filter-select';
import {
  approvalPositionLabels,
  approvalPositionOptions,
  approvalRoleLabels,
  approvalRoleOptions,
  rejectionReasonMaxLength,
  toMembershipReviewFailure,
  type ApprovalPosition,
  type ApprovalRole,
} from '../model/membership-review';
import {
  membershipDetailQueryOptions,
  pendingMembershipsQueryOptions,
  rosterCandidatesQueryOptions,
} from '../model/membership-review-queries';
import * as styles from './membership-review-dialog.css';

export type MembershipReviewAction = 'approve' | 'reject';

type MembershipReviewDialogProps = {
  memberId: number;
  action: MembershipReviewAction;
  onClose: () => void;
  onMissing: () => void;
  onConflict: () => void;
  onCompleted: (action: MembershipReviewAction) => void;
};

type DialogView = 'match' | 'registration' | 'rejection';

export function MembershipReviewDialog({
  memberId,
  action,
  onClose,
  onMissing,
  onConflict,
  onCompleted,
}: MembershipReviewDialogProps) {
  const queryClient = useQueryClient();
  const generationContext = useOptionalAdminGeneration();
  const [view, setView] = useState<DialogView>(action === 'approve' ? 'match' : 'rejection');
  const [generationId, setGenerationId] = useState<number>();
  const [role, setRole] = useState<ApprovalRole>();
  const [position, setPosition] = useState<ApprovalPosition>();
  const [selectedRosterEntryId, setSelectedRosterEntryId] = useState<number>();
  const [actionError, setActionError] = useState<string>();

  const detailQuery = useQuery(membershipDetailQueryOptions(memberId));
  const detail = detailQuery.data;
  const defaultGenerationId =
    generationContext?.currentGeneration.generationId ?? detail?.memberships[0]?.generationId;
  const effectiveGenerationId = generationId ?? defaultGenerationId;
  const effectiveRole = role ?? detail?.role ?? 'PLAYER';
  const effectivePosition = position ?? (detail === undefined ? 'WEB' : getInitialPosition(detail));
  const candidateQuery = useQuery({
    ...rosterCandidatesQueryOptions(memberId, effectiveGenerationId ?? 0),
    enabled: action === 'approve' && view === 'match' && effectiveGenerationId !== undefined,
  });

  useEffect(() => {
    if (detailQuery.error && toMembershipReviewFailure(detailQuery.error).status === 404) {
      onMissing();
    }
  }, [detailQuery.error, onMissing]);

  const selectedCandidateId = candidateQuery.data?.some(
    (candidate) => candidate.rosterEntryId === selectedRosterEntryId,
  )
    ? selectedRosterEntryId
    : candidateQuery.data?.[0]?.rosterEntryId;

  const listQuery = pendingMembershipsQueryOptions();
  const detailQueryKey = membershipDetailQueryOptions(memberId).queryKey;

  async function invalidateReviewQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listQuery.queryKey }),
      queryClient.invalidateQueries({ queryKey: detailQueryKey }),
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

  if (detailQuery.isPending) {
    return (
      <ReviewDialogShell title="가입 심사" onClose={onClose} className={styles.matchDialog}>
        <Dialog.Body>
          <output className={styles.loading}>가입 신청 정보를 불러오는 중입니다.</output>
        </Dialog.Body>
      </ReviewDialogShell>
    );
  }

  if (detailQuery.error || detail === undefined) {
    return (
      <ReviewDialogShell title="가입 심사" onClose={onClose} className={styles.matchDialog}>
        <Dialog.Body>
          <p className={styles.error} role="alert">
            가입 신청 정보를 불러오지 못했어요. 다시 시도해 주세요.
          </p>
        </Dialog.Body>
        <Dialog.Footer className={styles.footer}>
          <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
            닫기
          </ActionButton>
        </Dialog.Footer>
      </ReviewDialogShell>
    );
  }

  const memberName = detail.name ?? '회원';
  const generationOptions = getGenerationOptions(
    generationContext?.generations,
    effectiveGenerationId,
  );

  if (view === 'registration') {
    return (
      <RegistrationDialog
        detail={detail}
        generationId={effectiveGenerationId}
        generationOptions={generationOptions}
        onGenerationChange={setGenerationId}
        role={effectiveRole}
        onRoleChange={setRole}
        position={effectivePosition}
        onPositionChange={setPosition}
        actionError={actionError}
        actionPending={approve.isPending}
        onClose={onClose}
        onBack={() => {
          setActionError(undefined);
          setView('match');
        }}
        onSubmit={() => {
          setActionError(undefined);
          if (effectiveGenerationId === undefined) {
            setActionError('기수를 선택해 주세요.');
            return;
          }
          approve.mutate({
            path: { memberId },
            body: {
              approvalType: 'MANUAL',
              role: effectiveRole,
              generationId: effectiveGenerationId,
              position: effectivePosition,
              phoneNumber: getOptionalTrimmedValue(detail.phoneNumber),
            },
          });
        }}
      />
    );
  }

  if (view === 'rejection') {
    return (
      <RejectionDialog
        memberName={memberName}
        actionError={actionError}
        actionPending={reject.isPending}
        onClose={onClose}
        onSubmit={(reason) => {
          setActionError(undefined);
          reject.mutate({ path: { memberId }, body: { reason } });
        }}
      />
    );
  }

  return (
    <MatchMemberDialog
      detail={detail}
      generationId={effectiveGenerationId}
      candidates={candidateQuery.data}
      candidatesPending={candidateQuery.isPending}
      candidatesError={candidateQuery.error}
      selectedRosterEntryId={selectedCandidateId}
      onSelectCandidate={setSelectedRosterEntryId}
      actionError={actionError}
      actionPending={approve.isPending}
      onClose={onClose}
      onRegister={() => {
        setActionError(undefined);
        setView('registration');
      }}
      onConnect={() => {
        setActionError(undefined);
        if (effectiveGenerationId === undefined || selectedCandidateId === undefined) {
          setActionError('연결할 명단 회원을 선택해 주세요.');
          return;
        }
        approve.mutate({
          path: { memberId },
          body: {
            approvalType: 'ROSTER',
            role: effectiveRole,
            generationId: effectiveGenerationId,
            rosterEntryId: selectedCandidateId,
          },
        });
      }}
    />
  );
}

function ReviewDialogShell({
  title,
  onClose,
  className,
  children,
}: {
  title: string;
  onClose: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={className} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseButton aria-label="가입 심사 닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            {children}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function MatchMemberDialog({
  detail,
  generationId,
  candidates,
  candidatesPending,
  candidatesError,
  selectedRosterEntryId,
  onSelectCandidate,
  actionError,
  actionPending,
  onClose,
  onRegister,
  onConnect,
}: {
  detail: MemberDetailResponse;
  generationId: number | undefined;
  candidates: RosterCandidateView[] | undefined;
  candidatesPending: boolean;
  candidatesError: unknown;
  selectedRosterEntryId: number | undefined;
  onSelectCandidate: (rosterEntryId: number) => void;
  actionError: string | undefined;
  actionPending: boolean;
  onClose: () => void;
  onRegister: () => void;
  onConnect: () => void;
}) {
  const memberName = detail.name ?? '회원';
  const membership = detail.memberships[0];

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.matchDialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <div className={styles.eyebrow}>MATCH MEMBER</div>
              <Dialog.Title>{memberName}님을 명단에서 찾았어요</Dialog.Title>
              <Dialog.Description>
                가입 신청 정보와 일치하는 회원을 확인해 주세요.
              </Dialog.Description>
              <Dialog.CloseButton aria-label="가입 승인 닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <Dialog.Body className={styles.body}>
              <dl className={styles.requestSummary} aria-label="신청 정보">
                <div className={styles.requestSummaryItem}>
                  <dt className={styles.requestSummaryLabel}>이름</dt>
                  <dd className={styles.requestSummaryValue}>{memberName}</dd>
                </div>
                <div className={styles.requestSummaryItem}>
                  <dt className={styles.requestSummaryLabel}>기수</dt>
                  <dd className={styles.requestSummaryValue}>{generationId ?? '-'}</dd>
                </div>
                <div className={styles.requestSummaryItem}>
                  <dt className={styles.requestSummaryLabel}>파트</dt>
                  <dd className={styles.requestSummaryValue}>{membership?.position ?? '-'}</dd>
                </div>
              </dl>

              <section className={styles.candidateSection} aria-labelledby="candidate-title">
                <div className={styles.sectionHeader}>
                  <h2 id="candidate-title" className={styles.sectionTitle}>
                    후보 회원
                  </h2>
                  <span className={styles.sectionCount}>
                    {candidates === undefined ? '-' : `${candidates.length}명이 검색되었어요`}
                  </span>
                </div>
                <CandidateListContent
                  candidates={candidates}
                  pending={candidatesPending}
                  error={candidatesError}
                  selectedRosterEntryId={selectedRosterEntryId}
                  onSelect={onSelectCandidate}
                />
              </section>
              {actionError ? (
                <p className={styles.error} role="alert">
                  {actionError}
                </p>
              ) : null}
            </Dialog.Body>
            <Dialog.Footer className={styles.footer}>
              <ActionButton
                type="button"
                variant="neutralWeak"
                disabled={actionPending}
                onClick={onRegister}
              >
                새 회원으로 등록
              </ActionButton>
              <ActionButton
                type="button"
                variant="brandSolid"
                disabled={actionPending || candidatesPending || selectedRosterEntryId === undefined}
                loading={actionPending}
                onClick={onConnect}
              >
                이 회원과 연결
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function CandidateOption({
  candidate,
  selected,
  onSelect,
}: {
  candidate: RosterCandidateView;
  selected: boolean;
  onSelect: (rosterEntryId: number) => void;
}) {
  const role = candidate.role === null ? '-' : approvalRoleLabels[candidate.role];
  const position = candidate.position === null ? '-' : approvalPositionLabels[candidate.position];

  return (
    <li>
      <label
        className={selected ? `${styles.candidate} ${styles.candidateSelected}` : styles.candidate}
      >
        <input
          className={styles.radio}
          type="radio"
          name="roster-candidate"
          checked={selected}
          onChange={() => onSelect(candidate.rosterEntryId)}
        />
        <span className={styles.candidateAvatar} aria-hidden="true">
          {candidate.name.slice(0, 1)}
        </span>
        <span className={styles.candidateInfo}>
          <span className={styles.candidateName}>{candidate.name}</span>
          <span className={styles.candidateMeta}>
            {candidate.generationId}기 · {position} · {role} · {candidate.phoneNumber}
          </span>
        </span>
        <span className={styles.candidateStatus}>명단 회원</span>
      </label>
    </li>
  );
}

function CandidateListContent({
  candidates,
  pending,
  error,
  selectedRosterEntryId,
  onSelect,
}: {
  candidates: RosterCandidateView[] | undefined;
  pending: boolean;
  error: unknown;
  selectedRosterEntryId: number | undefined;
  onSelect: (rosterEntryId: number) => void;
}) {
  if (pending) {
    return <output className={styles.loading}>후보 회원을 불러오는 중입니다.</output>;
  }
  if (error) {
    return (
      <p className={styles.error} role="alert">
        후보 회원을 불러오지 못했어요. 다시 시도해 주세요.
      </p>
    );
  }
  if (candidates === undefined || candidates.length === 0) {
    return <p className={styles.error}>일치하는 후보 회원이 없어요.</p>;
  }
  return (
    <ul className={styles.candidateList}>
      {candidates.map((candidate) => (
        <CandidateOption
          key={candidate.rosterEntryId}
          candidate={candidate}
          selected={candidate.rosterEntryId === selectedRosterEntryId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function RegistrationDialog({
  detail,
  generationId,
  generationOptions,
  onGenerationChange,
  role,
  onRoleChange,
  position,
  onPositionChange,
  actionError,
  actionPending,
  onClose,
  onBack,
  onSubmit,
}: {
  detail: MemberDetailResponse;
  generationId: number | undefined;
  generationOptions: readonly AdminGenerationListItemResponse[];
  onGenerationChange: (generationId: number) => void;
  role: ApprovalRole;
  onRoleChange: (role: ApprovalRole) => void;
  position: ApprovalPosition;
  onPositionChange: (position: ApprovalPosition) => void;
  actionError: string | undefined;
  actionPending: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const generationValues = generationOptions.map((generation) => String(generation.generationId));
  const generationLabels = Object.fromEntries(
    generationOptions.map((generation) => [
      String(generation.generationId),
      generation.generationName,
    ]),
  ) as Record<string, string>;
  const selectedGeneration = generationId === undefined ? '' : String(generationId);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.registrationDialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <div className={styles.eyebrow}>REGISTRATION</div>
              <Dialog.Title>신규 회원 등록</Dialog.Title>
              <Dialog.Description>회원의 기본 정보와 권한을 변경할 수 있어요.</Dialog.Description>
              <Dialog.CloseButton aria-label="신규 회원 등록 닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <form
              className={styles.form}
              aria-label="신규 회원 등록"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <Dialog.Body className={styles.body}>
                <fieldset className={styles.formFields} disabled={actionPending}>
                  <legend className={styles.visuallyHidden}>신규 회원 정보</legend>
                  <Field.Root className={styles.readOnlyField}>
                    <Field.Label>이름</Field.Label>
                    <TextField.Root value={detail.name ?? '-'}>
                      <TextField.Input name="name" readOnly />
                    </TextField.Root>
                  </Field.Root>
                  {generationValues.length > 0 ? (
                    <FilterSelect
                      label="기수"
                      value={selectedGeneration}
                      options={generationValues}
                      labels={generationLabels}
                      onChange={(value) => onGenerationChange(Number(value))}
                    />
                  ) : (
                    <p className={styles.error} role="alert">
                      선택할 수 있는 기수 정보가 없어요.
                    </p>
                  )}
                  <FilterSelect
                    label="직군"
                    value={position}
                    options={approvalPositionOptions}
                    labels={approvalPositionLabels}
                    onChange={onPositionChange}
                  />
                  <FilterSelect
                    label="권한"
                    value={role}
                    options={approvalRoleOptions}
                    labels={registrationRoleLabels}
                    onChange={onRoleChange}
                  />
                </fieldset>
                {actionError ? (
                  <p className={styles.error} role="alert">
                    {actionError}
                  </p>
                ) : null}
              </Dialog.Body>
              <Dialog.Footer className={styles.footer}>
                <ActionButton type="button" variant="neutralWeak" onClick={onBack}>
                  취소
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="brandSolid"
                  disabled={actionPending || generationId === undefined}
                  loading={actionPending}
                >
                  저장하기
                </ActionButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function RejectionDialog({
  memberName,
  actionError,
  actionPending,
  onClose,
  onSubmit,
}: {
  memberName: string;
  actionError: string | undefined;
  actionPending: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [attempted, setAttempted] = useState(false);
  const isValid = reason.length >= 1 && reason.length <= rejectionReasonMaxLength;
  const validationMessage = getRejectionValidationMessage(reason);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!isValid) {
      return;
    }
    onSubmit(reason);
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.rejectionDialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <div className={`${styles.eyebrow} ${styles.rejectionEyebrow}`}>REJECT</div>
              <Dialog.Title>가입 거절</Dialog.Title>
              <Dialog.Description>{memberName}님의 가입 신청을 거절할게요.</Dialog.Description>
              <Dialog.CloseButton aria-label="가입 거절 닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <form className={styles.form} aria-label="가입 거절" noValidate onSubmit={submit}>
              <Dialog.Body className={styles.body}>
                <Field.Root invalid={attempted && !isValid}>
                  <Field.Label>거절 사유</Field.Label>
                  <TextField.Root value={reason} onValueChange={setReason}>
                    <TextField.Textarea
                      className={styles.rejectionInput}
                      name="reason"
                      maxLength={rejectionReasonMaxLength}
                      placeholder="거절 사유를 입력해 주세요"
                      required
                      autoresize={false}
                    />
                  </TextField.Root>
                  <p className={styles.rejectionHelper}>
                    <span className={styles.rejectionHelperDot} aria-hidden="true">
                      •
                    </span>
                    앱 화면에 사유가 노출돼요.
                  </p>
                  <p className={styles.characterCount} aria-live="polite">
                    {reason.length}/{rejectionReasonMaxLength}
                  </p>
                  {attempted && validationMessage !== undefined ? (
                    <Field.ErrorMessage role="alert">{validationMessage}</Field.ErrorMessage>
                  ) : null}
                </Field.Root>
                {actionError ? (
                  <p className={styles.error} role="alert">
                    {actionError}
                  </p>
                ) : null}
              </Dialog.Body>
              <Dialog.Footer className={styles.footer}>
                <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                  취소
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="criticalSolid"
                  disabled={actionPending || !isValid}
                  loading={actionPending}
                >
                  거절하기
                </ActionButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function getGenerationOptions(
  generations: readonly AdminGenerationListItemResponse[] | undefined,
  fallbackGenerationId: number | undefined,
) {
  if (generations !== undefined && generations.length > 0) {
    return generations;
  }
  return fallbackGenerationId === undefined
    ? []
    : [
        {
          generationId: fallbackGenerationId,
          generationNumber: fallbackGenerationId,
          generationName: `${fallbackGenerationId}기`,
        },
      ];
}

function getInitialPosition(detail: MemberDetailResponse): ApprovalPosition {
  const position = detail.memberships.find((membership) => membership.position !== null)?.position;
  return position !== null && position !== undefined && position in approvalPositionLabels
    ? position
    : 'WEB';
}

function getSaveErrorMessage(error: unknown) {
  const failure = toMembershipReviewFailure(error);
  if (failure.status === 400 || failure.code === 'INVALID_MEMBER_REQUEST') {
    return failure.message ?? '입력값을 확인해 주세요.';
  }
  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }
  return '가입 심사를 처리하지 못했어요. 다시 시도해 주세요.';
}

const registrationRoleLabels: Record<ApprovalRole, string> = {
  PLAYER: '활동회원',
  OB: '운영진',
  COMPLETED_MEMBER: '수료회원',
  DEFERRED: '유예회원',
};

function getRejectionValidationMessage(reason: string) {
  if (reason.length === 0) {
    return '거절 사유를 입력해 주세요.';
  }
  if (reason.length > rejectionReasonMaxLength) {
    return '거절 사유는 최대 2,000자까지 입력해 주세요.';
  }
  return undefined;
}

function getOptionalTrimmedValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
