/** 세션 조회 상태에 따라 로딩·오류·빈 상태 또는 정렬된 목록을 표시합니다. */
import { useSessionsQuery } from '../model/session-queries';
import { sortSessions } from '../model/session';
import { type SessionFilter } from '../model/session-search';
import { SessionLoadingState, SessionRefreshingState } from './session-loading-state';
import { SessionList } from './session-list';
import { SessionEmptyState } from './session-empty-state';
import { SessionErrorState } from './session-error-state';
import { placeholder } from './sessions-page.css';

export function SessionResults({
  type,
  onResetFilter,
  onCreate,
}: {
  type: SessionFilter;
  onResetFilter: () => void;
  onCreate: () => void;
}) {
  const query = useSessionsQuery();

  if (!import.meta.env.DEV) {
    return <p className={placeholder}>세션 관리 기능을 준비 중입니다.</p>;
  }

  if (query.isPending) {
    return <SessionLoadingState />;
  }

  if (query.isError) {
    return <SessionErrorState retrying={query.isFetching} onRetry={() => void query.refetch()} />;
  }

  const sessions = sortSessions(query.data).filter(
    (session) => type === 'all' || session.type === type,
  );

  if (sessions.length === 0) {
    return <SessionEmptyState type={type} onResetFilter={onResetFilter} onCreate={onCreate} />;
  }

  return (
    <>
      {query.isFetching && <SessionRefreshingState />}
      <SessionList sessions={sessions} type={type} />
    </>
  );
}
