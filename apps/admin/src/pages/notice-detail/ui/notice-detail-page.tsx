/** 상세 페이지의 탐색과 데이터 조회 영역을 조합한다. */
import { Link } from '@tanstack/react-router';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeDetailResult } from './notice-detail-result';
import * as styles from './notice-detail-page.css';

/** 공지별 조회 상태를 초기화하고 URL 기반 탭 탐색을 유지한다. */
export function NoticeDetailPage({ noticeId, tab }: { noticeId: string; tab: NoticeDetailTab }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 상세</h1>

      <Link className={styles.link} to="/notices" search={{}}>
        공지 목록으로 돌아가기
      </Link>

      <NoticeDetailTabs noticeId={noticeId} />

      <NoticeDetailResult key={noticeId} noticeId={noticeId} tab={tab} />
    </main>
  );
}

/** 탭 이동 시 공지 ID와 스크롤 위치를 보존한다. */
function NoticeDetailTabs({ noticeId }: { noticeId: string }) {
  return (
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
  );
}
