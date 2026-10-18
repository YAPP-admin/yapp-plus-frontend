import type { SessionFilter } from '../model/session-search';
import { useSessionsQuery } from '../model/session-queries';
import { sortSessions } from '../model/session';
import { SessionTypeFilter } from './session-type-filter';
import { SessionList } from './session-list';
import { page, title, description, placeholder } from './sessions-page.css';

export function SessionsPage({
  type,
  onTypeChange,
}: {
  type: SessionFilter;
  onTypeChange: (type: SessionFilter) => void;
}) {
  const sessionsQuery = useSessionsQuery();
  const sessions = sortSessions(sessionsQuery.data ?? []).filter(
    (session) => type === 'all' || session.type === type,
  );

  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      {sessionsQuery.isSuccess ? (
        <SessionList sessions={sessions} type={type} />
      ) : (
        <p className={placeholder}>
          {import.meta.env.DEV ? '세션 목록을 준비 중입니다.' : '세션 관리 기능을 준비 중입니다.'}
        </p>
      )}
    </main>
  );
}
