import { Ellipsis } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { Badge, Menu } from '@seed-design/react';
import type { Session, SessionAttendanceSummary } from '~/features/session-management';
import { sessionFilterLabels } from '../model/session-search';
import * as styles from './session-card.css';

const attendanceFields = [
  { key: 'present', label: '출석' },
  { key: 'late', label: '지각' },
  { key: 'absent', label: '결석' },
  { key: 'pending', label: '미처리' },
  { key: 'reported', label: '출결 보고' },
] satisfies { key: keyof SessionAttendanceSummary; label: string }[];

export function SessionCard({
  session,
  onEdit,
}: {
  session: Session;
  onEdit?: (session: Session) => void;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={session.type === 'offline' ? 'informative' : 'neutral'}>
          {sessionFilterLabels[session.type]}
        </Badge>
        {onEdit && (
          <Menu.Root placement="bottom-end" gutter={4}>
            <Menu.Trigger asChild>
              <ActionButton
                type="button"
                variant="neutralWeak"
                size="small"
                className={styles.menuButton}
                aria-label={`${session.name} 정보`}
              >
                <Ellipsis size={18} aria-hidden="true" />
              </ActionButton>
            </Menu.Trigger>
            <Menu.Positioner data-seed-color-mode="dark-only">
              <Menu.Content>
                <Menu.ScrollArea>
                  <Menu.Group>
                    <Menu.Item onClick={() => onEdit(session)}>
                      <Menu.ItemBody>
                        <Menu.ItemLabel>수정</Menu.ItemLabel>
                      </Menu.ItemBody>
                    </Menu.Item>
                  </Menu.Group>
                </Menu.ScrollArea>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </div>
      <h2 className={styles.name}>{session.name}</h2>
      <SessionDetails session={session} />
      <SessionAttendance attendance={session.attendance} />
    </article>
  );
}

function SessionDetails({ session }: { session: Session }) {
  const locationLabel =
    session.type === 'offline'
      ? [session.location.roadAddress, session.location.detailAddress].filter(Boolean).join(' ')
      : session.location.guide || '팀별 자율 장소';
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
        <dd className={styles.value}>{locationLabel}</dd>
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
