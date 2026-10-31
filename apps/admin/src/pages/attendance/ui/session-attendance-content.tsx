import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ActionButton } from '@yapp-plus/ui';
import {
  closeAttendance,
  cancelAttendance,
  AttendanceQueryBoundary,
  attendanceHistoryQueryOptions,
  attendanceCodeQueryOptions,
  teamReviewsQueryOptions,
  sessionAttendanceQueryOptions,
  updateMemberAttendance,
  updateMemberBadge,
  updateTeamPhotoReview,
  issueAttendanceCode,
  reissueAttendanceCode,
  type AttendanceEditInput,
  type AttendanceMemberViewModel,
  type AttendanceCodeViewModel,
  type AttendanceSessionViewModel,
  type TeamDecisionInput,
  type TeamReviewViewModel,
} from '~/features/session-management';
import { attendancePartSchema, partLabels, type AttendancePart } from '../model/attendance-search';
import * as styles from './session-attendance-content.css';

const statusLabels = {
  present: '출석',
  late: '지각',
  earlyLeave: '조퇴',
  absent: '결석',
  undecided: '미정',
  unsupported: '확인 필요',
};
const reportLabels = { late: '지각', earlyLeave: '조퇴', absence: '결석' };
const reviewStateLabels = {
  pending: '검수 대기',
  approved: '검수 완료',
  rejected: '반려됨',
  notSubmitted: '사진 미제출',
  unknown: '상태 확인 필요',
};
const summaryStatuses = ['present', 'late', 'earlyLeave', 'absent', 'undecided'] as const;
const editableStatuses = ['undecided', 'present', 'late', 'earlyLeave', 'absent'] as const;
const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const formatTime = (value: string | null) =>
  value ? timeFormatter.format(new Date(value)) : '기록 없음';

function createAttendanceEdit(
  member: AttendanceMemberViewModel,
  status: AttendanceEditInput['status'],
): AttendanceEditInput {
  if (status === 'late' || status === 'earlyLeave') {
    return {
      membershipId: member.membershipId,
      status,
      penaltyCategory: 'regular',
      durationBand: 'withinOneHour',
      reason: member.attendance.reason,
    };
  }
  if (status === 'absent') {
    return {
      membershipId: member.membershipId,
      status,
      penaltyCategory: 'regular',
      durationBand: null,
      reason: member.attendance.reason,
    };
  }
  return {
    membershipId: member.membershipId,
    status,
    penaltyCategory: null,
    durationBand: null,
    reason: member.attendance.reason,
  };
}

function MemberRow({
  member,
  onAttendanceChange,
  onBadgeChange,
  onHistoryOpen,
  disabled,
}: {
  member: AttendanceMemberViewModel;
  onAttendanceChange: (
    member: AttendanceMemberViewModel,
    status: AttendanceEditInput['status'],
  ) => void;
  onBadgeChange: (member: AttendanceMemberViewModel) => void;
  onHistoryOpen: (member: AttendanceMemberViewModel) => void;
  disabled: boolean;
}) {
  const part = attendancePartSchema.safeParse(member.part);
  return (
    <tr>
      <th scope="row">
        <strong>{member.name}</strong>
        <span className={styles.secondary}>
          {part.success ? partLabels[part.data] : '직군 미확인'}
        </span>
      </th>
      <td>{member.latestReport ? reportLabels[member.latestReport.type] : '보고 없음'}</td>
      <td>{formatTime(member.attendance.checkedInAt)}</td>
      <td>
        <label className={styles.inlineControl}>
          <span className={styles.visuallyHidden}>{member.name} 출결 상태</span>
          <select
            aria-label={`${member.name} 출결 상태`}
            value={
              member.attendance.status === 'unsupported' ? 'undecided' : member.attendance.status
            }
            disabled={disabled || !member.isEditable}
            onChange={(event) => {
              const status = editableStatuses.find((option) => option === event.target.value);
              if (status) {
                onAttendanceChange(member, status);
              }
            }}
          >
            {editableStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.secondary}>
          {member.score.delta === null ? '점수 확인 필요' : `${member.score.delta}점`}
        </span>
      </td>
      <td>
        <ActionButton
          variant="neutralWeak"
          size="small"
          type="button"
          disabled={disabled || !member.isEditable}
          onClick={() => onBadgeChange(member)}
        >
          {member.badge.verified ? '확인 해제' : '명찰 확인'}
        </ActionButton>
        {member.badge.verified && (
          <span className={styles.secondary}>{formatTime(member.badge.verifiedAt)}</span>
        )}
      </td>
      <td>
        <ActionButton
          variant="neutralWeak"
          size="small"
          type="button"
          onClick={() => onHistoryOpen(member)}
        >
          이력
        </ActionButton>
      </td>
    </tr>
  );
}

function ReportRow({ member }: { member: AttendanceMemberViewModel }) {
  const report = member.latestReport;
  if (!report) {
    return null;
  }
  const part = attendancePartSchema.safeParse(member.part);
  const eligibilityLabels = {
    eligible: '인정 대상',
    ineligible: '확인 필요',
    unknown: '판단 보류',
  };
  return (
    <tr>
      <th scope="row">
        <strong>{member.name}</strong>
        <span className={styles.secondary}>
          {part.success ? partLabels[part.data] : '직군 미확인'}
        </span>
      </th>
      <td>{reportLabels[report.type]}</td>
      <td>{report.reason}</td>
      <td>{formatTime(report.submittedAt)}</td>
      <td>{eligibilityLabels[report.eligibility]}</td>
    </tr>
  );
}

function TeamReviewRow({
  review,
  disabled,
  onDecision,
}: {
  review: TeamReviewViewModel;
  disabled: boolean;
  onDecision: (input: TeamDecisionInput) => void;
}) {
  const selectedMembers = review.photo
    ? review.members.filter((member) =>
        review.photo?.selectedMembershipIds.includes(member.membershipId),
      )
    : [];
  let attendanceTargetLabel = '미정';
  if (review.photo) {
    attendanceTargetLabel =
      selectedMembers.length > 0 ? selectedMembers.map((member) => member.name).join(', ') : '없음';
  }
  return (
    <li className={styles.reviewCard}>
      <div>
        <strong>{review.teamName}</strong>
        <span className={styles.secondary}>{reviewStateLabels[review.reviewState]}</span>
      </div>
      {review.photo ? (
        <div className={styles.reviewMeta}>
          {review.photo.access === 'available' ? (
            <a
              className={styles.photoLink}
              href={review.photo.readUrl}
              target="_blank"
              rel="noreferrer"
            >
              검수 사진 열기
            </a>
          ) : (
            <span>사진을 확인할 수 없습니다.</span>
          )}
          <span className={styles.secondary}>
            {review.photo.uploaderName ?? '업로더 미상'} · {formatTime(review.photo.submittedAt)}
          </span>
        </div>
      ) : (
        <span className={styles.secondary}>제출된 사진이 없습니다.</span>
      )}
      <span className={styles.secondary}>출석 대상: {attendanceTargetLabel}</span>
      {review.reviewState === 'pending' && review.photo?.access === 'available' && (
        <div className={styles.reviewActions}>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={disabled}
            onClick={() =>
              onDecision({
                photoId: review.photo?.photoId ?? '',
                decision: 'approve',
                reason: null,
              })
            }
          >
            승인
          </ActionButton>
          <ActionButton
            variant="neutralWeak"
            size="small"
            type="button"
            disabled={disabled}
            onClick={() =>
              onDecision({ photoId: review.photo?.photoId ?? '', decision: 'reject', reason: null })
            }
          >
            반려
          </ActionButton>
        </div>
      )}
    </li>
  );
}

function AttendanceCodeCard({
  code,
  isPending,
  error,
  onIssue,
  onReissue,
}: {
  code: AttendanceCodeViewModel | undefined;
  isPending: boolean;
  error: boolean;
  onIssue: () => void;
  onReissue: () => void;
}) {
  return (
    <section className={styles.card} aria-busy={isPending} aria-label="출석 코드">
      <h2 className={styles.heading}>출석 코드</h2>
      {isPending && <output>출석 코드를 처리하는 중입니다.</output>}
      {code?.state === 'notIssued' && (
        <div className={styles.codeContent}>
          <p className={styles.secondary}>아직 출석 코드가 발급되지 않았습니다.</p>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onIssue}
          >
            출석 코드 발급
          </ActionButton>
        </div>
      )}
      {code?.state === 'active' && (
        <div className={styles.codeContent}>
          <strong className={styles.codeValue}>{code.code}</strong>
          <span className={styles.secondary}>만료 시각 · {formatTime(code.expiresAt)}</span>
          <ActionButton
            variant="neutralWeak"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onReissue}
          >
            코드 재발급
          </ActionButton>
        </div>
      )}
      {code?.state === 'expired' && (
        <div className={styles.codeContent}>
          {code.code && <strong className={styles.codeValue}>{code.code}</strong>}
          <span className={styles.secondary}>출석 코드가 만료되었습니다.</span>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onReissue}
          >
            코드 재발급
          </ActionButton>
        </div>
      )}
      {error && <span role="alert">출석 코드 처리에 실패했습니다. 다시 시도해 주세요.</span>}
    </section>
  );
}

export function SessionAttendanceContent({
  sessionId,
  part,
}: {
  sessionId: string;
  part: AttendancePart;
}) {
  return (
    <AttendanceQueryBoundary
      fallback={<output>출석 내역을 불러오는 중입니다.</output>}
      errorMessage="출석 내역을 불러오지 못했습니다."
      resetKey={`session-attendance-${sessionId}`}
    >
      <SessionAttendanceData sessionId={sessionId} part={part} />
    </AttendanceQueryBoundary>
  );
}

function SessionAttendanceData({ sessionId, part }: { sessionId: string; part: AttendancePart }) {
  const [historyMember, setHistoryMember] = useState<AttendanceMemberViewModel | null>(null);
  const queryClient = useQueryClient();
  const [{ data: attendance }, { data: attendanceCode }] = useSuspenseQueries({
    queries: [sessionAttendanceQueryOptions(sessionId), attendanceCodeQueryOptions(sessionId)],
  });
  const attendanceMutation = useMutation({
    mutationFn: (input: AttendanceEditInput) => updateMemberAttendance(sessionId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions', sessionId, 'attendance'] }),
  });
  const badgeMutation = useMutation({
    mutationFn: (member: AttendanceMemberViewModel) =>
      updateMemberBadge(sessionId, {
        membershipId: member.membershipId,
        verified: !member.badge.verified,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions', sessionId, 'attendance'] }),
  });
  const issueCodeMutation = useMutation({
    mutationFn: () => issueAttendanceCode(sessionId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'attendance-code'],
      }),
  });
  const reissueCodeMutation = useMutation({
    mutationFn: () => reissueAttendanceCode(sessionId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'attendance-code'],
      }),
  });
  const closeMutation = useMutation({
    mutationFn: () => closeAttendance(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'attendance'],
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelAttendance(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'attendance'],
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
    },
  });
  const teamReviewMutation = useMutation({
    mutationFn: (input: TeamDecisionInput) => updateTeamPhotoReview(sessionId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'team-reviews'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'sessions', sessionId, 'attendance'],
      });
    },
  });
  const { session, members } = attendance;
  const attendanceCodeCard = (
    <AttendanceCodeCard
      code={attendanceCode}
      isPending={issueCodeMutation.isPending || reissueCodeMutation.isPending}
      error={issueCodeMutation.isError || reissueCodeMutation.isError}
      onIssue={() => issueCodeMutation.mutate()}
      onReissue={() => reissueCodeMutation.mutate()}
    />
  );
  if (session.type === 'team') {
    return (
      <AttendanceQueryBoundary
        fallback={<output>팀 사진 검수 목록을 불러오는 중입니다.</output>}
        errorMessage="팀 사진 검수 목록을 불러오지 못했습니다."
        resetKey={`team-reviews-${sessionId}`}
      >
        <TeamSessionContent
          sessionId={sessionId}
          session={session}
          attendanceCodeCard={attendanceCodeCard}
          closePending={closeMutation.isPending}
          closeError={closeMutation.isError}
          onClose={() => closeMutation.mutate()}
          cancelPending={cancelMutation.isPending}
          cancelError={cancelMutation.isError}
          onCancel={() => cancelMutation.mutate()}
          teamDecisionPending={teamReviewMutation.isPending}
          teamDecisionError={teamReviewMutation.isError}
          onTeamDecision={(input) => teamReviewMutation.mutate(input)}
        />
      </AttendanceQueryBoundary>
    );
  }
  const visibleMembers = members.filter((member) => part === 'all' || member.part === part);
  const reportedMembers = visibleMembers.filter((member) => member.latestReport);
  return (
    <RegularSessionContent
      sessionId={sessionId}
      session={session}
      visibleMembers={visibleMembers}
      reportedMembers={reportedMembers}
      attendanceCodeCard={attendanceCodeCard}
      attendancePending={attendanceMutation.isPending}
      onAttendanceChange={(input) => attendanceMutation.mutate(input)}
      badgePending={badgeMutation.isPending}
      onBadgeChange={(member) => badgeMutation.mutate(member)}
      historyMember={historyMember}
      onHistoryOpen={setHistoryMember}
      onHistoryClose={() => setHistoryMember(null)}
      closePending={closeMutation.isPending}
      closeError={closeMutation.isError}
      onClose={() => closeMutation.mutate()}
      cancelPending={cancelMutation.isPending}
      cancelError={cancelMutation.isError}
      onCancel={() => cancelMutation.mutate()}
    />
  );
}

function TeamSessionContent({
  sessionId,
  session,
  attendanceCodeCard,
  closePending,
  closeError,
  onClose,
  cancelPending,
  cancelError,
  onCancel,
  teamDecisionPending,
  teamDecisionError,
  onTeamDecision,
}: {
  sessionId: string;
  session: AttendanceSessionViewModel;
  attendanceCodeCard: ReactNode;
  closePending: boolean;
  closeError: boolean;
  onClose: () => void;
  cancelPending: boolean;
  cancelError: boolean;
  onCancel: () => void;
  teamDecisionPending: boolean;
  teamDecisionError: boolean;
  onTeamDecision: (input: TeamDecisionInput) => void;
}) {
  const { data: teamReviews } = useSuspenseQuery(teamReviewsQueryOptions(sessionId));
  const pendingReviewCount = teamReviews.filter(
    (review) => review.reviewState === 'pending',
  ).length;
  const sessionAction = getSessionAction({
    session,
    closePending,
    onClose,
    cancelPending,
    onCancel,
    blockClose: pendingReviewCount > 0,
  });

  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          팀 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
        <div className={styles.sessionActions}>
          {sessionAction}
          {pendingReviewCount > 0 && (
            <output>검수 대기 사진 {pendingReviewCount}건을 먼저 처리해 주세요.</output>
          )}
          {closeError && <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>}
          {cancelError && <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>}
          {teamDecisionError && (
            <span role="alert">사진 검수 저장에 실패했습니다. 다시 시도해 주세요.</span>
          )}
        </div>
      </section>
      {attendanceCodeCard}
      <section className={styles.card} aria-label="팀 사진 검수">
        <h2 className={styles.heading}>팀 사진 검수</h2>
        <ul className={styles.reviewList}>
          {teamReviews.map((review) => (
            <TeamReviewRow
              key={review.teamId}
              review={review}
              disabled={teamDecisionPending || session.phase === 'closed'}
              onDecision={onTeamDecision}
            />
          ))}
        </ul>
        {teamReviews.length === 0 && <output>검수할 팀 사진이 없습니다.</output>}
      </section>
    </>
  );
}

function RegularSessionContent({
  sessionId,
  session,
  visibleMembers,
  reportedMembers,
  attendanceCodeCard,
  attendancePending,
  onAttendanceChange,
  badgePending,
  onBadgeChange,
  historyMember,
  onHistoryOpen,
  onHistoryClose,
  closePending,
  closeError,
  onClose,
  cancelPending,
  cancelError,
  onCancel,
}: {
  sessionId: string;
  session: AttendanceSessionViewModel;
  visibleMembers: AttendanceMemberViewModel[];
  reportedMembers: AttendanceMemberViewModel[];
  attendanceCodeCard: ReactNode;
  attendancePending: boolean;
  onAttendanceChange: (input: AttendanceEditInput) => void;
  badgePending: boolean;
  onBadgeChange: (member: AttendanceMemberViewModel) => void;
  historyMember: AttendanceMemberViewModel | null;
  onHistoryOpen: (member: AttendanceMemberViewModel) => void;
  onHistoryClose: () => void;
  closePending: boolean;
  closeError: boolean;
  onClose: () => void;
  cancelPending: boolean;
  cancelError: boolean;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<'attendance' | 'reports'>('attendance');
  const sessionAction = getSessionAction({
    session,
    closePending,
    onClose,
    cancelPending,
    onCancel,
    blockClose: false,
  });

  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          정규 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
        <div className={styles.sessionActions}>
          {sessionAction}
          {closeError && <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>}
          {cancelError && <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>}
        </div>
      </section>
      {attendanceCodeCard}
      <section className={styles.card} aria-label="출석 요약">
        <h2 className={styles.heading}>출석 요약 · 전체 {session.summary.total}명</h2>
        <dl className={styles.summary}>
          {summaryStatuses.map((status) => (
            <div className={styles.stat} key={status}>
              <dt>{statusLabels[status]}</dt>
              <dd>{session.summary[status]}명</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className={styles.tabs} aria-label="출석부 보기" role="tablist">
        <button
          className={tab === 'attendance' ? styles.activeTab : styles.tab}
          id="attendance-tab"
          role="tab"
          aria-controls="attendance-panel"
          aria-selected={tab === 'attendance'}
          type="button"
          onClick={() => setTab('attendance')}
        >
          출석 체크 {visibleMembers.length}
        </button>
        <button
          className={tab === 'reports' ? styles.activeTab : styles.tab}
          id="reports-tab"
          role="tab"
          aria-controls="reports-panel"
          aria-selected={tab === 'reports'}
          type="button"
          onClick={() => setTab('reports')}
        >
          사전 보고 기록 {reportedMembers.length}
        </button>
      </div>
      {tab === 'reports' ? (
        <section
          className={styles.scroll}
          id="reports-panel"
          role="tabpanel"
          aria-labelledby="reports-tab"
          aria-label="사전 보고 기록 목록"
          tabIndex={0}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>
              사전 보고 기록 · {reportedMembers.length}명
            </caption>
            <thead>
              <tr>
                {['참가자', '보고 유형', '사유', '제출 시각', '적격성'].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportedMembers.map((member) => (
                <ReportRow key={member.membershipId} member={member} />
              ))}
            </tbody>
          </table>
          {reportedMembers.length === 0 && <output>사전 보고 기록이 없습니다.</output>}
        </section>
      ) : (
        <section
          className={styles.scroll}
          id="attendance-panel"
          role="tabpanel"
          aria-labelledby="attendance-tab"
          aria-label="회원 출석 목록"
          tabIndex={0}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>출석 체크 · {visibleMembers.length}명</caption>
            <thead>
              <tr>
                {[
                  '참가자',
                  '사전 보고',
                  '앱 출석',
                  '현재 출결 · 점수',
                  '명찰 확인',
                  '변경 이력',
                ].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member) => (
                <MemberRow
                  key={member.membershipId}
                  member={member}
                  disabled={attendancePending || badgePending}
                  onAttendanceChange={(nextMember, status) =>
                    onAttendanceChange(createAttendanceEdit(nextMember, status))
                  }
                  onBadgeChange={onBadgeChange}
                  onHistoryOpen={onHistoryOpen}
                />
              ))}
            </tbody>
          </table>
          {visibleMembers.length === 0 && <output>해당 직군의 출석 대상자가 없습니다.</output>}
        </section>
      )}
      {historyMember && (
        <section className={styles.historyPanel} aria-label="출결 변경 이력">
          <div className={styles.historyHeader}>
            <h2 className={styles.heading}>{historyMember.name} 출결 변경 이력</h2>
            <ActionButton variant="neutralWeak" size="small" type="button" onClick={onHistoryClose}>
              닫기
            </ActionButton>
          </div>
          <AttendanceQueryBoundary
            fallback={<output>변경 이력을 불러오는 중입니다.</output>}
            errorMessage="변경 이력을 불러오지 못했습니다."
            resetKey={`attendance-history-${sessionId}-${historyMember.membershipId}`}
          >
            <AttendanceHistoryData
              sessionId={sessionId}
              membershipId={historyMember.membershipId}
            />
          </AttendanceQueryBoundary>
        </section>
      )}
    </>
  );
}

function AttendanceHistoryData({
  sessionId,
  membershipId,
}: {
  sessionId: string;
  membershipId: string;
}) {
  const { data: history } = useSuspenseQuery(
    attendanceHistoryQueryOptions(sessionId, membershipId),
  );

  if (history.length === 0) {
    return <output>변경 이력이 없습니다.</output>;
  }

  return (
    <ul className={styles.historyList}>
      {history.map((entry) => (
        <li key={entry.id}>
          <strong>
            {statusLabels[entry.before.status]} → {statusLabels[entry.after.status]}
          </strong>
          <span className={styles.secondary}>
            {formatTime(entry.changedAt)} · {entry.actorName ?? '담당자 미상'}
          </span>
          {entry.reason && <span className={styles.secondary}>사유: {entry.reason}</span>}
        </li>
      ))}
    </ul>
  );
}

function getSessionAction({
  session,
  closePending,
  onClose,
  cancelPending,
  onCancel,
  blockClose,
}: {
  session: AttendanceSessionViewModel;
  closePending: boolean;
  onClose: () => void;
  cancelPending: boolean;
  onCancel: () => void;
  blockClose: boolean;
}) {
  if (session.phase === 'closed' && session.canCancelClose) {
    return (
      <ActionButton
        variant="neutralWeak"
        size="small"
        type="button"
        disabled={cancelPending}
        onClick={onCancel}
      >
        마감 취소
      </ActionButton>
    );
  }
  if (session.phase === 'open') {
    return (
      <ActionButton
        variant="brandSolid"
        size="small"
        type="button"
        disabled={closePending || blockClose}
        onClick={onClose}
      >
        출석 마감
      </ActionButton>
    );
  }
  return null;
}
