/** 선택한 필터에 따라 빈 목록 안내와 필터 초기화 또는 생성 CTA를 표시합니다. */
import { ActionButton } from '@seed-design/react';
import type { SessionFilter } from '../model/session-search';
import { Inbox } from 'lucide-react';
import * as styles from './session-state.css';

export function SessionEmptyState({
  type,
  onResetFilter,
}: {
  type: SessionFilter;
  onResetFilter: () => void;
}) {
  const filtered = type !== 'all';

  return (
    <section className={styles.panel} aria-label="빈 세션 목록">
      <Inbox size={24} aria-hidden="true" className={styles.icon} />
      <h2 className={styles.title}>
        {filtered ? '조건에 맞는 세션이 없어요' : '아직 만든 세션이 없어요'}
      </h2>
      <p className={styles.description}>
        {filtered
          ? '필터를 초기화하고 전체 세션을 확인해 보세요.'
          : '첫 세션을 만들고 회원들의 출석을 관리해 보세요.'}
      </p>
      {filtered ? (
        <ActionButton variant="neutralWeak" size="medium" onClick={onResetFilter}>
          필터 초기화
        </ActionButton>
      ) : (
        <>
          <ActionButton
            variant="neutralWeak"
            size="medium"
            disabled
            aria-describedby="session-create-pending"
          >
            세션 만들기
          </ActionButton>
          <p id="session-create-pending" className={styles.description}>
            세션 생성 기능을 준비 중입니다.
          </p>
        </>
      )}
    </section>
  );
}
