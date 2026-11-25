/** 팀 매핑 URL과 현재 기수 기반 API 화면을 연결한다. */
import { createFileRoute, stripSearchParams, useBlocker } from '@tanstack/react-router';
import {
  TeamMappingApiPage,
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
      <TeamMappingApiPage
        key={search.filter}
        search={search}
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
