import { Menu } from '@seed-design/react';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { Ellipsis } from 'lucide-react';
import type { SessionViewModel } from '../model/session-api-model';
import { sessionFilterLabels } from '../model/session-search';
import * as styles from './session-card.css';

const ATTENDANCE_FIELDS = [
  { key: 'present', label: '출석' },
  { key: 'late', label: '지각' },
  { key: 'absent', label: '결석' },
  { key: 'pending', label: '미처리' },
  { key: 'reported', label: '출결 보고' },
] satisfies { key: keyof SessionViewModel['attendance']; label: string }[];

export function SessionCard({
  session,
  onEdit,
  onDelete,
}: {
  session: SessionViewModel;
  onEdit?: (session: SessionViewModel) => void;
  onDelete?: (session: SessionViewModel) => void;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <Badge variant="weak" tone={session.type === 'regular' ? 'informative' : 'neutral'}>
          {sessionFilterLabels[session.type]}
        </Badge>
        {onEdit || onDelete ? (
          <Menu.Root placement="bottom-end" gutter={4}>
            <Menu.Trigger asChild>
              <ActionButton
                type="button"
                variant="neutralWeak"
                size="small"
                className={styles.menuButton}
                aria-label={`${session.name} 관리`}
              >
                <Ellipsis size={18} aria-hidden="true" />
              </ActionButton>
            </Menu.Trigger>
            <Menu.Positioner data-seed-color-mode="dark-only">
              <Menu.Content>
                <Menu.ScrollArea>
                  <Menu.Group>
                    {onEdit ? (
                      <Menu.Item onClick={() => onEdit(session)}>
                        <Menu.ItemBody>
                          <Menu.ItemLabel>정보</Menu.ItemLabel>
                        </Menu.ItemBody>
                      </Menu.Item>
                    ) : null}
                    {onDelete ? (
                      <Menu.Item
                        disabled={session.attendance.started}
                        onClick={() => onDelete(session)}
                      >
                        <Menu.ItemBody>
                          <Menu.ItemLabel>삭제</Menu.ItemLabel>
                          {session.attendance.started ? (
                            <Menu.ItemDescription>
                              출석이 시작되어 삭제할 수 없습니다.
                            </Menu.ItemDescription>
                          ) : null}
                        </Menu.ItemBody>
                      </Menu.Item>
                    ) : null}
                  </Menu.Group>
                </Menu.ScrollArea>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        ) : null}
      </div>
      <h2 className={styles.name}>{session.name}</h2>
      <SessionDetails session={session} />
      <SessionAttendance attendance={session.attendance} />
    </article>
  );
}

function SessionDetails({ session }: { session: SessionViewModel }) {
  const locationLabel =
    session.type === 'regular'
      ? [session.location.roadAddress, session.location.detailAddress].filter(Boolean).join(' ')
      : '팀별 자율 장소';
  return (
    <dl className={styles.details}>
      <div className={styles.detail}>
        <dt className={styles.term}>일정</dt>
        <dd className={styles.value}>
          <time dateTime={`${session.date}T${session.startTime}+09:00`}>
            {session.date.replaceAll('-', '.')} · {session.startTime.slice(0, 5)}
          </time>
          {' – '}
          <time dateTime={`${session.date}T${session.endTime}+09:00`}>
            {session.endTime.slice(0, 5)}
          </time>
        </dd>
      </div>
      <div className={styles.detail}>
        <dt className={styles.term}>장소</dt>
        <dd className={styles.value}>{locationLabel}</dd>
      </div>
    </dl>
  );
}

function SessionAttendance({ attendance }: { attendance: SessionViewModel['attendance'] }) {
  return (
    <dl className={styles.attendance} aria-label="출석 현황">
      {ATTENDANCE_FIELDS.map(({ key, label }) => (
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
