import { FilterSelect } from '~/shared/ui/filter-select';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  useMemberScoresQuery,
  useSessionsQuery,
  type MemberScoreViewModel,
} from '~/features/session-management';
import {
  attendancePartSchema,
  attendanceSessionPartSchema,
  partLabels,
  type AttendancePart,
  type AttendanceSessionPart,
} from '../model/attendance-search';
import * as styles from './attendance-page.css';
import { SessionAttendanceContent } from './session-attendance-content';

type FilterProps<T extends AttendanceSessionPart> = { part: T; onPartChange: (part: T) => void };

function PartFilter<T extends AttendanceSessionPart>({
  part,
  onPartChange,
  options,
  allLabel = '모든 직군',
}: FilterProps<T> & { options: readonly T[]; allLabel?: string }) {
  const labels = { ...partLabels, all: allLabel };
  return (
    <FilterSelect
      className={styles.filter}
      label="직군"
      value={part}
      options={options}
      labels={labels}
      onChange={onPartChange}
    />
  );
}

function AttendanceLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {children}
    </main>
  );
}

export function AttendanceSessionsPage(props: FilterProps<AttendanceSessionPart>) {
  const sessionsQuery = useSessionsQuery();
  return (
    <AttendanceLayout title="출석부" description="출석을 확인할 세션을 선택합니다.">
      <PartFilter
        {...props}
        options={['all', ...attendanceSessionPartSchema.options.filter((part) => part !== 'all')]}
        allLabel="모든 세션"
      />
      {sessionsQuery.isPending && <output>세션 목록을 불러오는 중입니다.</output>}
      {sessionsQuery.isError && <p role="alert">세션 목록을 불러오지 못했습니다.</p>}
      {sessionsQuery.data && sessionsQuery.data.length === 0 && (
        <p className={styles.placeholder}>등록된 세션이 없습니다.</p>
      )}
      {sessionsQuery.data && sessionsQuery.data.length > 0 && (
        <ul className={styles.sessionList} aria-label="출석 세션 목록">
          {sessionsQuery.data.map((session) => (
            <li key={session.id}>
              <Link
                className={styles.sessionLink}
                to="/attendance/$sessionId"
                params={{ sessionId: session.id }}
                search={{ part: 'all' }}
              >
                <strong>{session.name}</strong>
                <span>
                  {session.type === 'offline' ? '정규 세션' : '팀 세션'} ·{' '}
                  {session.date.replaceAll('-', '.')} · {session.startTime}
                </span>
                <span>
                  출석 {session.attendance.present}명 · 미정 {session.attendance.pending}명
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AttendanceLayout>
  );
}

export function SessionAttendancePage({
  sessionId,
  ...props
}: FilterProps<AttendancePart> & { sessionId: string }) {
  return (
    <AttendanceLayout title="세션별 출석부" description="선택한 세션의 직군별 출석을 확인합니다.">
      <p className={styles.description}>세션 ID: {sessionId}</p>
      <Link className={styles.backLink} to="/attendance" search={{}}>
        세션 목록으로 돌아가기
      </Link>
      <PartFilter {...props} options={attendancePartSchema.options} />
      <SessionAttendanceContent sessionId={sessionId} part={props.part} />
    </AttendanceLayout>
  );
}

export function AttendanceScoresPage(props: FilterProps<AttendancePart>) {
  const scoresQuery = useMemberScoresQuery();
  const labels = { ...partLabels, all: '모든 직군' };
  const scores = scoresQuery.data ? filterMemberScores(scoresQuery.data, props.part) : undefined;

  return (
    <AttendanceLayout title="출석 총점" description="직군별 출석 총점을 확인합니다.">
      <PartFilter {...props} options={attendancePartSchema.options} />
      <p className={styles.scoreNotice}>
        현재는 화면 검증용 mock 점수입니다. 실제 관리자 누적 점수 API 연동 전까지 서버 점수로
        간주하지 않습니다.
      </p>
      {scoresQuery.isPending && <output>회원 점수를 불러오는 중입니다.</output>}
      {scoresQuery.isError && <p role="alert">회원 점수를 불러오지 못했습니다.</p>}
      {scores && scores.length === 0 && (
        <p className={styles.placeholder}>{labels[props.part]} 직군의 회원이 없습니다.</p>
      )}
      {scores && scores.length > 0 && (
        <div className={styles.scoreTableWrap}>
          <table className={styles.scoreTable} aria-label="회원 누적 점수">
            <thead>
              <tr>
                <th className={styles.scoreHeader} scope="col">
                  회원
                </th>
                <th className={styles.scoreHeader} scope="col">
                  직군
                </th>
                <th className={styles.scoreHeader} scope="col">
                  총점
                </th>
                <th className={styles.scoreHeader} scope="col">
                  근거
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <ScoreRow key={score.membershipId} score={score} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AttendanceLayout>
  );
}

export function filterMemberScores(scores: readonly MemberScoreViewModel[], part: AttendancePart) {
  return scores.filter((score) => part === 'all' || score.part === part);
}

export function ScoreRow({ score }: { score: MemberScoreViewModel }) {
  return (
    <tr>
      <th className={styles.scoreCell} scope="row">
        {score.name}
      </th>
      <td className={styles.scoreCell}>{score.part ?? '미지정'}</td>
      <td className={`${styles.scoreCell} ${score.warning ? styles.scoreWarning : ''}`}>
        <span className={styles.scoreValue}>
          {score.totalScore === null ? '계산 대기' : `${score.totalScore}점`}
        </span>
        {score.warning && <span> · 40점 미만</span>}
      </td>
      <td className={styles.scoreCell}>
        <details className={styles.scoreDetail} aria-label={`${score.name} 점수 근거`}>
          <summary className={styles.scoreDetailSummary}>상세 보기</summary>
          <ul className={styles.scoreDetailList}>
            {score.attendanceEntries.map((entry) => (
              <li className={styles.scoreDetailItem} key={entry.sessionId}>
                <span>{entry.title}</span>
                <span>{entry.score.delta === null ? '확인 필요' : `${entry.score.delta}점`}</span>
              </li>
            ))}
            {score.adjustmentEntries.map((entry) => (
              <li className={styles.scoreDetailItem} key={entry.id}>
                <span>{entry.description}</span>
                <span>{entry.delta}점</span>
              </li>
            ))}
          </ul>
        </details>
      </td>
    </tr>
  );
}
