import { Badge } from '@seed-design/react';
import type { Session, SessionAttendanceSummary } from '../model/session';
import { sessionFilterLabels } from '../model/session-search';
import * as styles from './session-card.css';

const attendanceFields = [
  { key: 'present', label: '출석' },
  { key: 'late', label: '지각' },
  { key: 'absent', label: '결석' },
  { key: 'pending', label: '미처리' },
  { key: 'reported', label: '출결 보고' },
] satisfies { key: keyof SessionAttendanceSummary; label: string }[];

export function SessionCard({ session }: { session: Session }) {
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={session.type === 'offline' ? 'informative' : 'neutral'}>
          {sessionFilterLabels[session.type]}
        </Badge>
      </div>
      <h2 className={styles.name}>{session.name}</h2>
      <SessionDetails session={session} />
      <SessionAttendance attendance={session.attendance} />
    </article>
  );
}

function SessionDetails({
  session,
}: {
  session: Pick<Session, 'date' | 'startTime' | 'endTime' | 'location'>;
}) {
  return (
    <dl className={styles.details}>
      <div className={styles.detail}>
        <dt className={styles.term}>일정</dt>
        <dd className={styles.value}>
          <time dateTime={`${session.date}T${session.startTime}+09:00`}>
            {session.date.replaceAll('-', '.')} · {session.startTime}
          </time>
          {' – '}
          <time dateTime={`${session.date}T${session.endTime}+09:00`}>{session.endTime}</time>
        </dd>
      </div>
      <div className={styles.detail}>
        <dt className={styles.term}>장소</dt>
        <dd className={styles.value}>{session.location}</dd>
      </div>
    </dl>
  );
}

function SessionAttendance({ attendance }: { attendance: SessionAttendanceSummary }) {
  return (
    <dl className={styles.attendance} aria-label="출석 현황">
      {attendanceFields.map(({ key, label }) => (
        <div key={key} className={styles.stat}>
          <dt>{label}</dt>
          <dd className={styles.count}>
            {attendance[key]}
            <span className={styles.unit}>명</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
