/** 공지 목록 제목과 설명을 표시한다. */
import * as styles from './notice-list-header.css';

/** 조회 상태와 무관하게 목록 제목과 설명을 유지한다. */
export function NoticeListHeader() {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>NOTICE MANAGEMENT</p>
        <h1 className={styles.title}>공지 목록</h1>
        <p className={styles.description}>회원에게 전달한 공지와 확인 현황을 관리합니다.</p>
      </div>
    </header>
  );
}
