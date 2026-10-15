import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { MembersPage, memberSearchSchema, memberSearchDefaults } from '~/pages/members';

export const Route = createFileRoute('/_dashboard/members/')({
  validateSearch: memberSearchSchema,
  search: { middlewares: [stripSearchParams(memberSearchDefaults)] },
  head: () => ({ meta: [{ title: '회원 관리 | YAPP+ Admin' }] }),
  component: MembersRoute,
});

function MembersRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MembersPage
      search={search}
      onSearch={(query) => {
        void navigate({
          search: (previous) => ({ ...previous, q: query }),
          replace: true,
          resetScroll: false,
        });
      }}
      onFilterChange={(change) => {
        void navigate({ search: (previous) => ({ ...previous, ...change }), resetScroll: false });
      }}
    />
  );
}
