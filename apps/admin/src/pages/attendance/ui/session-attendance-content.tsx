import { useQuery } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import { ActionButton } from '@yapp-plus/ui';
import {
  getSessionAttendance,
  type AttendanceMemberViewModel,
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
const summaryStatuses = ['present', 'late', 'earlyLeave', 'absent', 'undecided'] as const;
const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const formatTime = (value: string | null) =>
  value ? timeFormatter.format(new Date(value)) : '기록 없음';

function MemberRow({ member }: { member: AttendanceMemberViewModel }) {
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
        <strong>{statusLabels[member.attendance.status]}</strong>
        <span className={styles.secondary}>
          {member.score.delta === null ? '점수 확인 필요' : `${member.score.delta}점`}
        </span>
      </td>
      <td>
        {member.badge.verified ? '확인 완료' : '미확인'}
        {member.badge.verified && (
          <span className={styles.secondary}>{formatTime(member.badge.verifiedAt)}</span>
        )}
      </td>
    </tr>
  );
}

export function SessionAttendanceContent({
  sessionId,
  part,
}: {
  sessionId: string;
  part: AttendancePart;
}) {
  const hydrated = useHydrated();
  const query = useQuery({
    queryKey: ['admin', 'sessions', sessionId, 'attendance'],
    queryFn: () => getSessionAttendance(sessionId),
    enabled: hydrated,
    retry: false,
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
  if (session.type === 'team') {
    return <p>팀 세션의 사진 검수 화면을 준비 중입니다.</p>;
  }
  const visibleMembers = members.filter((member) => part === 'all' || member.part === part);
  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          정규 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
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
      <section className={styles.scroll} aria-label="회원 출석 목록">
        <table className={styles.table}>
          <caption className={styles.caption}>출석 체크 · {visibleMembers.length}명</caption>
          <thead>
            <tr>
              {['참가자', '사전 보고', '앱 출석', '현재 출결 · 점수', '명찰 확인'].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleMembers.map((member) => (
              <MemberRow key={member.membershipId} member={member} />
            ))}
          </tbody>
        </table>
        {visibleMembers.length === 0 && <output>해당 직군의 출석 대상자가 없습니다.</output>}
      </section>
    </>
  );
}
