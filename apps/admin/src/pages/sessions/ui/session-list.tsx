/** 결과 개수와 카드 또는 전체·필터 빈 상태를 표시합니다. */
import type { Session } from '~/features/session-management';
import { sessionFilterLabels, type SessionFilter } from '../model/session-search';
import { SessionCard } from './session-card';
import { list, count, placeholder } from './sessions-page.css';

export function SessionList({
  sessions,
  type,
  totalCount,
  onEdit,
}: {
  sessions: Session[];
  type: SessionFilter;
  totalCount: number;
  onEdit?: (session: Session) => void;
}) {
  return (
    <>
      <output className={count}>
        {sessionFilterLabels[type]} {sessions.length}개
      </output>
      {sessions.length === 0 ? (
        <p className={placeholder}>
          {totalCount === 0 ? '등록된 세션이 없습니다.' : '선택한 유형의 세션이 없습니다.'}
        </p>
      ) : (
        <ul className={list} aria-label="세션 목록">
          {sessions.map((session) => (
            <li key={session.id}>
              <SessionCard session={session} onEdit={onEdit} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
