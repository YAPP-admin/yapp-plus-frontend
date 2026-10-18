/** URL에서 전달된 유형 필터를 목록과 연결하는 세션 관리 페이지입니다. */
import type { SessionFilter } from '../model/session-search';
import { SessionTypeFilter } from './session-type-filter';
import { SessionResults } from './session-results';
import { page, title, description } from './sessions-page.css';

export function SessionsPage({
  type,
  onTypeChange,
}: {
  type: SessionFilter;
  onTypeChange: (type: SessionFilter) => void;
}) {
  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      <SessionResults type={type} onResetFilter={() => onTypeChange('all')} />
    </main>
  );
}
