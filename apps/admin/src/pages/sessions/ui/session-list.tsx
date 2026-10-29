/** 결과 개수와 카드 또는 전체·필터 빈 상태를 표시합니다. */
import type { Session } from '../model/session';
import { sessionFilterLabels, type SessionFilter } from '../model/session-search';
import { SessionCard } from './session-card';
import { list, count, placeholder } from './sessions-page.css';

export function SessionList({
  sessions,
  type,
  totalCount,
  complete = true,
  onEdit,
}: {
  sessions: Session[];
  type: SessionFilter;
  totalCount: number;
  complete?: boolean;
  onEdit?: (session: Session) => void;
}) {
  return (
    <>
      <output className={count}>
        {!complete && '확인된 '}
        {sessionFilterLabels[type]} {sessions.length}개
      </output>
      {sessions.length === 0 ? (
        <p className={placeholder}>
          {complete &&
            (totalCount === 0 ? '등록된 세션이 없습니다.' : '선택한 유형의 세션이 없습니다.')}
          {!complete && '전체 목록 조회 후 필터 결과를 확인할 수 있습니다.'}
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
