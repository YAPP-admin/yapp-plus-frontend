/** 조회된 세션의 결과 개수와 한 열의 카드 목록을 표시합니다. */
import type { Session } from '../model/session';
import { sessionFilterLabels, type SessionFilter } from '../model/session-search';
import { SessionCard } from './session-card';
import { list, count } from './sessions-page.css';

export function SessionList({ sessions, type }: { sessions: Session[]; type: SessionFilter }) {
  return (
    <>
      <output className={count}>
        {sessionFilterLabels[type]} {sessions.length}개
      </output>
      <ul className={list} aria-label="세션 목록">
        {sessions.map((session) => (
          <li key={session.id}>
            <SessionCard session={session} />
          </li>
        ))}
      </ul>
    </>
  );
}
