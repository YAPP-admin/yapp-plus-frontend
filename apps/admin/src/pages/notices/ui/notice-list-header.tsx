/** 공지 목록 제목과 전체 게시 개수를 표시한다. */
import * as styles from './notice-list-header.css';

/** 조회된 전체 게시 개수를 목록 제목과 함께 표시한다. */
export function NoticeListHeader({ count }: { count: number | undefined }) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>NOTICE MANAGEMENT</p>
        <h1 className={styles.title}>공지 목록</h1>
        <p className={styles.description}>회원에게 전달한 공지와 확인 현황을 관리합니다.</p>
      </div>
      {count !== undefined && (
        <p className={styles.total}>
          게시 중 <strong>{count}</strong>개
        </p>
      )}
    </header>
  );
}
