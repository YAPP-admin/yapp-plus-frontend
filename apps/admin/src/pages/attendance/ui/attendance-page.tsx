import { FilterSelect } from '~/shared/ui/filter-select';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useSessionsQuery } from '~/features/session-management';
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
  return (
    <AttendanceLayout title="출석 총점" description="직군별 출석 총점을 확인합니다.">
      <PartFilter {...props} options={attendancePartSchema.options} />
      <p className={styles.placeholder}>출석 총점을 준비 중입니다.</p>
    </AttendanceLayout>
  );
}
