/** 목록 조회 상태를 구분하며 필터는 라우터가 소유합니다. */
import { useSuspenseQuery } from '@tanstack/react-query';
import { find1Options } from '@yapp-plus/api/generated';
import type { SessionFilter } from '../model/session-search';
import { AttendanceQueryBoundary } from '~/features/session-management';
import { toSessionViewModel } from '../model/session-api-model';
import { SessionTypeFilter } from './session-type-filter';
import { SessionList } from './session-list';
import { page, title, description, placeholder } from './sessions-page.css';

type Props = {
  type: SessionFilter;
  generationId: number | null;
  onTypeChange: (type: SessionFilter) => void;
};

export function SessionsPage({ type, generationId, onTypeChange }: Props) {
  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      {generationId === null ? (
        <p className={placeholder}>기수 ID 설정이 필요합니다.</p>
      ) : (
        <AttendanceQueryBoundary
          fallback={<output className={placeholder}>세션 목록을 불러오는 중입니다.</output>}
          errorMessage="세션 목록을 불러오지 못했습니다."
          resetKey="session-management-list"
        >
          <SessionListData type={type} generationId={generationId} />
        </AttendanceQueryBoundary>
      )}
    </main>
  );
}

function SessionListData({ type, generationId }: { type: SessionFilter; generationId: number }) {
  const { data: sessionData } = useSuspenseQuery(
    find1Options({ path: { generationId }, query: { type: 'ALL' } }),
  );
  const sessions = sessionData.sessions
    .map(toSessionViewModel)
    .toSorted((left, right) =>
      `${right.date}T${right.startTime}`.localeCompare(`${left.date}T${left.startTime}`),
    )
    .filter((session) => type === 'all' || session.type === type);

  return <SessionList sessions={sessions} type={type} totalCount={sessionData.allCount} />;
}
