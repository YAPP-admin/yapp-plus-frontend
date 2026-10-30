import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { useState } from 'react';
import { ActionButton } from '@yapp-plus/ui';
import {
  closeAttendance,
  cancelAttendance,
  attendanceHistoryQueryOptions,
  teamReviewsQueryOptions,
  sessionAttendanceQueryOptions,
  updateMemberAttendance,
  updateMemberBadge,
  updateTeamPhotoReview,
  type AttendanceEditInput,
  type AttendanceMemberViewModel,
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

export function SessionAttendanceContent({
  sessionId,
  part,
}: {
  sessionId: string;
  part: AttendancePart;
}) {
  const [tab, setTab] = useState<'attendance' | 'reports'>('attendance');
  const [historyMember, setHistoryMember] = useState<AttendanceMemberViewModel | null>(null);
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const query = useQuery({
    ...sessionAttendanceQueryOptions(sessionId),
    enabled: hydrated,
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
  const historyQuery = useQuery({
    ...attendanceHistoryQueryOptions(sessionId, historyMember?.membershipId ?? ''),
    enabled: hydrated && historyMember !== null,
  });
  const teamReviewsQuery = useQuery({
    ...teamReviewsQueryOptions(sessionId),
    enabled: hydrated && query.data?.session.type === 'team',
  });
  if (query.isPending) {
    return <output>출석 내역을 불러오는 중입니다.</output>;
  }
  if (query.isError) {
    return (
      <div role="alert">
        <p>출석 내역을 불러오지 못했습니다.</p>
        <ActionButton
          variant="neutralWeak"
          size="small"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          다시 시도
        </ActionButton>
      </div>
    );
  }
  const { session, members } = query.data;
  const teamReviews = teamReviewsQuery.data ?? [];
  const pendingReviewCount = teamReviews.filter(
    (review) => review.reviewState === 'pending',
  ).length;
  let sessionAction = null;
  if (session.phase === 'closed' && session.canCancelClose) {
    sessionAction = (
      <ActionButton
        variant="neutralWeak"
        size="small"
        disabled={cancelMutation.isPending}
        onClick={() => cancelMutation.mutate()}
      >
        마감 취소
      </ActionButton>
    );
  } else if (session.phase === 'open') {
    sessionAction = (
      <ActionButton
        variant="brandSolid"
        size="small"
        disabled={closeMutation.isPending || (session.type === 'team' && pendingReviewCount > 0)}
        onClick={() => closeMutation.mutate()}
      >
        출석 마감
      </ActionButton>
    );
  }
  if (session.type === 'team') {
    return (
      <>
        <section className={styles.card} aria-label="세션 정보">
          <h2 className={styles.heading}>{session.title}</h2>
          <p className={styles.secondary}>
            팀 세션 ·{' '}
            {
              { closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[
                session.phase
              ]
            }
          </p>
          <div className={styles.sessionActions}>
            {sessionAction}
            {pendingReviewCount > 0 && (
              <output>검수 대기 사진 {pendingReviewCount}건을 먼저 처리해 주세요.</output>
            )}
            {closeMutation.isError && (
              <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>
            )}
            {cancelMutation.isError && (
              <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>
            )}
            {teamReviewMutation.isError && (
              <span role="alert">사진 검수 저장에 실패했습니다. 다시 시도해 주세요.</span>
            )}
          </div>
        </section>
        <section className={styles.card} aria-label="팀 사진 검수">
          <h2 className={styles.heading}>팀 사진 검수</h2>
          {teamReviewsQuery.isPending && <output>팀 사진 검수 목록을 불러오는 중입니다.</output>}
          {teamReviewsQuery.isError && (
            <div role="alert">
              <p>팀 사진 검수 목록을 불러오지 못했습니다.</p>
              <ActionButton
                variant="neutralWeak"
                size="small"
                disabled={teamReviewsQuery.isFetching}
                onClick={() => void teamReviewsQuery.refetch()}
              >
                다시 시도
              </ActionButton>
            </div>
          )}
          {teamReviewsQuery.data && (
            <ul className={styles.reviewList}>
              {teamReviewsQuery.data.map((review) => (
                <TeamReviewRow
                  key={review.teamId}
                  review={review}
                  disabled={teamReviewMutation.isPending || session.phase === 'closed'}
                  onDecision={(input) => teamReviewMutation.mutate(input)}
                />
              ))}
            </ul>
          )}
          {teamReviewsQuery.data?.length === 0 && <output>검수할 팀 사진이 없습니다.</output>}
        </section>
      </>
    );
  }
  const visibleMembers = members.filter((member) => part === 'all' || member.part === part);
  const reportedMembers = visibleMembers.filter((member) => member.latestReport);
  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          정규 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
        {session.type === 'offline' && (
          <div className={styles.sessionActions}>
            {sessionAction}
            {closeMutation.isError && (
              <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>
            )}
            {cancelMutation.isError && (
              <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>
            )}
          </div>
        )}
      </section>
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
      <nav className={styles.tabs} aria-label="출석부 보기">
        <button
          className={tab === 'attendance' ? styles.activeTab : styles.tab}
          type="button"
          aria-current={tab === 'attendance' ? 'page' : undefined}
          onClick={() => setTab('attendance')}
        >
          출석 체크 {visibleMembers.length}
        </button>
        <button
          className={tab === 'reports' ? styles.activeTab : styles.tab}
          type="button"
          aria-current={tab === 'reports' ? 'page' : undefined}
          onClick={() => setTab('reports')}
        >
          사전 보고 기록 {reportedMembers.length}
        </button>
      </nav>
      {tab === 'reports' ? (
        <section className={styles.scroll} aria-label="사전 보고 기록 목록">
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
        <section className={styles.scroll} aria-label="회원 출석 목록">
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
                  disabled={attendanceMutation.isPending || badgeMutation.isPending}
                  onAttendanceChange={(nextMember, status) =>
                    attendanceMutation.mutate(createAttendanceEdit(nextMember, status))
                  }
                  onBadgeChange={(nextMember) => badgeMutation.mutate(nextMember)}
                  onHistoryOpen={setHistoryMember}
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
            <ActionButton
              variant="neutralWeak"
              size="small"
              type="button"
              onClick={() => setHistoryMember(null)}
            >
              닫기
            </ActionButton>
          </div>
          {historyQuery.isPending && <output>변경 이력을 불러오는 중입니다.</output>}
          {historyQuery.isError && <p role="alert">변경 이력을 불러오지 못했습니다.</p>}
          {historyQuery.data && historyQuery.data.length === 0 && (
            <output>변경 이력이 없습니다.</output>
          )}
          {historyQuery.data && historyQuery.data.length > 0 && (
            <ul className={styles.historyList}>
              {historyQuery.data.map((entry) => (
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
          )}
        </section>
      )}
    </>
  );
}
