/** 세션의 유형·일정·장소와 출석 집계를 표시하고 세션 정보·삭제 메뉴를 제공합니다. */
import { ActionButton, Badge, Menu, Portal } from '@seed-design/react';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
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

export function SessionCard({
  session,
  onEdit,
  onDelete,
}: {
  session: Session;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={session.type === 'regular' ? 'informative' : 'neutral'}>
          {sessionFilterLabels[session.type]}
        </Badge>
        {(onEdit ?? onDelete) && (
          <Menu.Root placement="bottom-end" open={menuOpen} onOpenChange={setMenuOpen}>
            <Menu.Trigger asChild>
              <ActionButton
                variant="ghost"
                size="small"
                aria-label={`${session.name} 메뉴`}
                className={styles.menuButton}
              >
                <EllipsisVertical size={24} aria-hidden="true" />
              </ActionButton>
            </Menu.Trigger>
            {menuOpen && (
              <Portal>
                <Menu.Positioner>
                  <Menu.Content data-seed-color-mode="dark-only">
                    <Menu.Group>
                      {onEdit && (
                        <Menu.Item className={styles.menuItem} onClick={() => onEdit(session)}>
                          <Menu.ItemBody>
                            <Menu.ItemLabel>세션 정보</Menu.ItemLabel>
                          </Menu.ItemBody>
                        </Menu.Item>
                      )}
                      {onDelete && (
                        <Menu.Item
                          className={styles.menuItem}
                          tone="critical"
                          onClick={() => onDelete(session)}
                        >
                          <Menu.ItemBody>
                            <Menu.ItemLabel>삭제</Menu.ItemLabel>
                          </Menu.ItemBody>
                        </Menu.Item>
                      )}
                    </Menu.Group>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            )}
          </Menu.Root>
        )}
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
