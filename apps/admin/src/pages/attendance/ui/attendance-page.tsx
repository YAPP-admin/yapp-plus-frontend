import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
  attendancePartSchema,
  attendanceSessionPartSchema,
  partLabels,
  type AttendancePart,
  type AttendanceSessionPart,
} from '../model/attendance-search';
import * as styles from './attendance-page.css';

type FilterProps<T extends AttendanceSessionPart> = { part: T; onPartChange: (part: T) => void };

function PartFilter<T extends AttendanceSessionPart>({
  part,
  onPartChange,
  options,
  allLabel = '모든 직군',
}: FilterProps<T> & { options: readonly T[]; allLabel?: string }) {
  return (
    <div className={styles.filter}>
      <label htmlFor="attendance-part">직군</label>
      <select
        id="attendance-part"
        className={styles.select}
        value={part}
        onChange={(event) => {
          const nextPart = options.find((option) => option === event.currentTarget.value);
          if (nextPart !== undefined) {
            onPartChange(nextPart);
          }
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'all' ? allLabel : partLabels[option]}
          </option>
        ))}
      </select>
    </div>
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
  return (
    <AttendanceLayout title="출석부" description="출석을 확인할 세션을 선택합니다.">
      <PartFilter
        {...props}
        options={['all', ...attendanceSessionPartSchema.options.filter((part) => part !== 'all')]}
        allLabel="모든 세션"
      />
      <p className={styles.placeholder}>세션 목록을 준비 중입니다.</p>
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
      <p className={styles.placeholder}>출석 내역을 준비 중입니다.</p>
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
