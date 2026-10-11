import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { NoticeDetailPage, noticeDetailSearchSchema } from '~/pages/notice-detail';

export const Route = createFileRoute('/_dashboard/notices_/$noticeId')({
  validateSearch: noticeDetailSearchSchema,
  search: { middlewares: [stripSearchParams({ tab: 'readers' })] },
  head: () => ({ meta: [{ title: '공지 상세 | YAPP+ Admin' }] }),
  component: NoticeDetailRoute,
});

function NoticeDetailRoute() {
  const { noticeId } = Route.useParams();
  const { tab } = Route.useSearch();

  return <NoticeDetailPage noticeId={noticeId} tab={tab} />;
}
