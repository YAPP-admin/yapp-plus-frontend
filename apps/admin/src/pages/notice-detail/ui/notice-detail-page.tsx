/** 상세 페이지의 탐색과 데이터 조회 영역을 조합한다. */
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeDetailResult } from './notice-detail-result';
import * as styles from './notice-detail-page.css';

/** 공지별 조회 상태를 초기화하고 URL 기반 탭 탐색을 유지한다. */
export function NoticeDetailPage({ noticeId, tab }: { noticeId: string; tab: NoticeDetailTab }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.visuallyHidden}>공지 상세</h1>

      <NoticeDetailResult key={noticeId} noticeId={noticeId} tab={tab} />
    </main>
  );
}
