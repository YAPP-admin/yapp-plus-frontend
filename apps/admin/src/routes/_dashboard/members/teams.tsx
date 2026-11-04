/** 팀 매핑 URL과 환경 공통 합성 fixture를 팀 매핑 페이지에 연결한다. */
import { createFileRoute, stripSearchParams, useBlocker } from '@tanstack/react-router';
import { getTeamMappingFixture } from '~/features/team-management';
import {
  TeamMappingPage,
  TeamMappingDraftProvider,
  TeamLeaveDialog,
  useTeamMappingDraft,
  teamMappingSearchDefaults,
  teamMappingSearchSchema,
} from '~/pages/team-mapping';

export const Route = createFileRoute('/_dashboard/members/teams')({
  staticData: { navigation: { menu: 'members', pageLabel: '팀 매핑' } },
  validateSearch: teamMappingSearchSchema,
  search: { middlewares: [stripSearchParams(teamMappingSearchDefaults)] },
  head: () => ({ meta: [{ title: '팀 매핑 | YAPP+ Admin' }] }),
  component: TeamMappingRoute,
});

function TeamMappingRoute() {
  return (
    <TeamMappingDraftProvider>
      <TeamMappingRouteContent />
    </TeamMappingDraftProvider>
  );
}

function TeamMappingRouteContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { hasDirtyDraft, resetDraft } = useTeamMappingDraft();
  const blocker = useBlocker({
    shouldBlockFn: () => hasDirtyDraft,
    enableBeforeUnload: hasDirtyDraft,
    withResolver: true,
  });

  return (
    <>
      <TeamMappingPage
        key={search.preview}
        snapshot={getTeamMappingFixture(search.preview)}
        search={search}
        onPreviewChange={(preview) => {
          void navigate({ search: (previous) => ({ ...previous, preview }), resetScroll: false });
        }}
        onFilterChange={(filter) => {
          void navigate({ search: (previous) => ({ ...previous, filter }), resetScroll: false });
        }}
      />
      <TeamLeaveDialog
        open={blocker.status === 'blocked'}
        onKeepEditing={() => blocker.reset?.()}
        onDiscard={() => {
          resetDraft();
          blocker.proceed?.();
        }}
      />
    </>
  );
}
