/** 목록 조회 상태를 구분하며 필터는 라우터가 소유합니다. */
import { useHydrated } from '@tanstack/react-router';
import { ActionButton } from '@yapp-plus/ui';
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
  const hydrated = useHydrated();
  const sessionsQuery = useSessionsQuery();

  function renderList() {
    if (!hydrated) {
      return <output className={placeholder}>세션 목록을 불러오는 중입니다.</output>;
    }
    if (sessionsQuery.isError) {
      return (
        <div role="alert" className={placeholder}>
          <p>세션 목록을 불러오지 못했습니다.</p>
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled={sessionsQuery.isFetching}
            onClick={() => void sessionsQuery.refetch({ cancelRefetch: false })}
          >
            다시 시도
          </ActionButton>
        </div>
      );
    }
    if (!sessionsQuery.isSuccess) {
      return <output className={placeholder}>세션 목록을 불러오는 중입니다.</output>;
    }
    const sessions = sortSessions(sessionsQuery.data).filter(
      (session) => type === 'all' || session.type === type,
    );
    return <SessionList sessions={sessions} type={type} totalCount={sessionsQuery.data.length} />;
  }

  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <p className={description}>예시 데이터입니다. 변경사항은 새로고침하면 초기화됩니다.</p>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      {renderList()}
    </main>
  );
}
