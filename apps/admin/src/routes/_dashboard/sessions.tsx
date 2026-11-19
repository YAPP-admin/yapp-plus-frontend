import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useAdminGeneration } from '~/features/admin-generation';
import { SessionsPage, sessionSearchSchema } from '~/pages/sessions';

export const Route = createFileRoute('/_dashboard/sessions')({
  staticData: { navigation: { menu: 'sessions', pageLabel: '세션 목록' } },
  validateSearch: sessionSearchSchema,
  search: { middlewares: [stripSearchParams({ type: 'all' })] },
  head: () => ({ meta: [{ title: '세션 관리 | YAPP+ Admin' }] }),
  component: SessionsRoute,
});

function SessionsRoute() {
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { currentGeneration } = useAdminGeneration();
  return (
    <SessionsPage
      type={type}
      generationId={currentGeneration.generationId}
      onTypeChange={(nextType) => {
        void navigate({ search: { type: nextType }, resetScroll: false });
      }}
    />
  );
}
