/** 빈 목록의 유형에 따라 SEED ResultSection의 생성·필터 초기화 CTA를 표시합니다. */
import { Inbox } from 'lucide-react';
import { ResultSection } from '~/shared/ui/result-section';
import type { SessionFilter } from '../model/session-search';
import { panel } from './session-state.css';

export function SessionEmptyState({
  type,
  onResetFilter,
  onCreate,
}: {
  type: SessionFilter;
  onResetFilter: () => void;
  onCreate: () => void;
}) {
  const filtered = type !== 'all';
  return (
    <section className={panel} aria-label="빈 세션 목록">
      <ResultSection
        asset={<Inbox size={24} aria-hidden="true" />}
        title={filtered ? '조건에 맞는 세션이 없어요' : '아직 만든 세션이 없어요'}
        description={
          filtered
            ? '필터를 초기화하고 전체 세션을 확인해 보세요.'
            : '첫 세션을 만들고 회원들의 출석을 관리해 보세요.'
        }
        primaryActionProps={{
          children: filtered ? '필터 초기화' : '세션 만들기',
          onClick: filtered ? onResetFilter : onCreate,
        }}
      />
    </section>
  );
}
