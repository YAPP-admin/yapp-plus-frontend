/** 공지·회원 조회 상태를 구분하고 성공한 데이터를 콘텐츠에 전달한다. */
import { useHydrated } from '@tanstack/react-router';
import { ActionButton } from '@yapp-plus/ui';
import { useNoticeQuery, useNoticeMembersQuery } from '~/features/notice-management';
import type { NoticeDetailTab } from '../model/notice-detail-search';
import { NoticeDetailContent } from './notice-detail-content';

/** 없는 공지와 통신 실패를 구별하고 재시도로 두 조회를 갱신한다. */
export function NoticeDetailResult({ noticeId, tab }: { noticeId: string; tab: NoticeDetailTab }) {
  const hydrated = useHydrated();
  const notice = useNoticeQuery(noticeId);
  const members = useNoticeMembersQuery();

  if (!import.meta.env.DEV || !hydrated) {
    return <p>공지 관리 기능을 준비 중입니다.</p>;
  }

  if (notice.isSuccess && notice.data === null) {
    return <output>공지를 찾을 수 없습니다.</output>;
  }

  if (notice.isError || members.isError) {
    return (
      <div role="alert">
        <p>공지 정보를 불러오지 못했습니다.</p>
        <ActionButton
          variant="neutralWeak"
          onClick={() => {
            void notice.refetch();
            void members.refetch();
          }}
        >
          다시 시도
        </ActionButton>
      </div>
    );
  }

  if (!notice.isSuccess || !members.isSuccess || !notice.data) {
    return <output>공지 정보를 불러오는 중입니다.</output>;
  }

  return <NoticeDetailContent notice={notice.data} members={members.data} tab={tab} />;
}
