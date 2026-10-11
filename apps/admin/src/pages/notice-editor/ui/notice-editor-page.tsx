import { Link } from '@tanstack/react-router';
import * as styles from './notice-editor-page.css';

export function NoticeCreatePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 작성</h1>
      <p className={styles.description}>공지 작성 기능을 준비 중입니다.</p>
      <Link className={styles.returnLink} to="/notices" search={{}}>
        공지 목록으로 돌아가기
      </Link>
    </main>
  );
}

export function NoticeEditPage({ noticeId }: { noticeId: string }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 수정</h1>
      <p className={styles.description}>공지 ID: {noticeId}</p>
      <p className={styles.description}>공지 수정 기능을 준비 중입니다.</p>
      <Link className={styles.returnLink} to="/notices/$noticeId" params={{ noticeId }} search={{}}>
        공지 상세로 돌아가기
      </Link>
    </main>
  );
}
