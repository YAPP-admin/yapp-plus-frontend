import { createFileRoute } from '@tanstack/react-router';
import { NoticeEditPage } from '~/pages/notice-editor';

export const Route = createFileRoute('/_dashboard/notices/$noticeId/edit')({
  head: () => ({ meta: [{ title: '공지 수정 | YAPP+ Admin' }] }),
  component: NoticeEditRoute,
});

function NoticeEditRoute() {
  const { noticeId } = Route.useParams();

  return <NoticeEditPage noticeId={noticeId} />;
}
