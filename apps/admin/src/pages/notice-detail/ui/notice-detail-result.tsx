/** 상세 조회 경계와 정상 콘텐츠를 분리한다. */
import { NoticeQueryBoundary, useNoticeDetailQuery } from '~/features/notice-management';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeDetailContent } from './notice-detail-content';

type Props = { noticeId: string; tab: NoticeDetailTab };

/** 최초 로딩·오류는 경계에서 처리한다. */
export function NoticeDetailResult(props: Props) {
  return (
    <NoticeQueryBoundary fallback={<output>공지 정보를 불러오는 중입니다.</output>}>
      <NoticeDetailData {...props} />
    </NoticeQueryBoundary>
  );
}

/** 조회가 완료된 데이터만 받아 없는 공지와 정상 공지를 구분한다. */
function NoticeDetailData({ noticeId, tab }: Props) {
  const { notice, members } = useNoticeDetailQuery(noticeId);

  return notice ? (
    <NoticeDetailContent notice={notice} members={members} tab={tab} />
  ) : (
    <output>공지를 찾을 수 없습니다.</output>
  );
}
