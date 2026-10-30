import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { memberPreviewBeforeMapping } from '~/features/member-management/fixtures';
import { MembersPage, memberSearchSchema, memberSearchDefaults } from '~/pages/members';

export const Route = createFileRoute('/_dashboard/members/')({
  staticData: { navigation: { menu: 'members', pageLabel: '회원 관리' } },
  validateSearch: memberSearchSchema,
  search: {
    middlewares: [
      stripSearchParams(memberSearchDefaults),
      // 허용한 조건만 URL에 남긴다. 입력 검증은 validateSearch가 담당한다.
      ({ search, next }) => {
        const { tab, q, part, team } = next(search);
        return { tab, q, part, team };
      },
    ],
  },
  head: () => ({ meta: [{ title: '회원 관리 | YAPP+ Admin' }] }),
  component: MembersRoute,
});

function MembersRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MembersPage
      search={search}
      members={import.meta.env.DEV ? memberPreviewBeforeMapping.members : undefined}
      currentGeneration={
        import.meta.env.DEV ? memberPreviewBeforeMapping.currentGeneration : undefined
      }
      teamMapping={import.meta.env.DEV ? memberPreviewBeforeMapping.teamMapping : undefined}
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
