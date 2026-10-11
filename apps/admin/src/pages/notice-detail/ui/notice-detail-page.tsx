import { Link } from '@tanstack/react-router';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import * as styles from './notice-detail-page.css';

export function NoticeDetailPage({ noticeId, tab }: { noticeId: string; tab: NoticeDetailTab }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 상세</h1>
      <p className={styles.description}>공지 ID: {noticeId}</p>
      <Link className={styles.link} to="/notices" search={{}}>
        공지 목록으로 돌아가기
      </Link>
      <nav className={styles.tabs} aria-label="공지 상세 구분">
        <Link
          className={styles.link}
          to="/notices/$noticeId"
          params={{ noticeId }}
          search={{ tab: 'readers' }}
          resetScroll={false}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          읽음
        </Link>
        <Link
          className={styles.link}
          to="/notices/$noticeId"
          params={{ noticeId }}
          search={{ tab: 'questions' }}
          resetScroll={false}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          질문
        </Link>
      </nav>
      <Link className={styles.link} to="/notices/$noticeId/edit" params={{ noticeId }} search={{}}>
        공지 수정
      </Link>
      <p className={styles.placeholder}>
        {tab === 'readers' ? '읽음 현황을 준비 중입니다.' : '질문 목록을 준비 중입니다.'}
      </p>
    </main>
  );
}
