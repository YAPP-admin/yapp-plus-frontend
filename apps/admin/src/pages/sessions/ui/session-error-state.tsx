/** 세션 조회 실패 안내와 재시도 버튼을 표시합니다. */
import { ActionButton } from '@seed-design/react';
import * as styles from './session-state.css';

export function SessionErrorState({
  retrying,
  onRetry,
}: {
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={styles.panel} aria-label="세션 조회 실패">
      <div role="alert" className={styles.message}>
        <h2 className={styles.title}>세션 목록을 불러오지 못했어요</h2>
        <p className={styles.description}>잠시 후 다시 시도해 주세요.</p>
      </div>
      <ActionButton variant="neutralWeak" size="medium" disabled={retrying} onClick={onRetry}>
        {retrying ? '다시 불러오는 중' : '다시 시도'}
      </ActionButton>
    </section>
  );
}
