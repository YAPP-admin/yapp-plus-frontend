import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { NoticesPage, noticeSearchSchema } from '~/pages/notices';

export const Route = createFileRoute('/_dashboard/notices/')({
  validateSearch: noticeSearchSchema,
  search: { middlewares: [stripSearchParams({ category: 'all' })] },
  head: () => ({ meta: [{ title: '공지 목록 | YAPP+ Admin' }] }),
  component: NoticesRoute,
});

function NoticesRoute() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <NoticesPage
      category={category}
      onCategoryChange={(nextCategory) => {
        void navigate({ search: { category: nextCategory }, resetScroll: false });
      }}
    />
  );
}
