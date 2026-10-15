import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { SessionsPage, sessionSearchSchema } from '~/pages/sessions';

export const Route = createFileRoute('/_dashboard/sessions')({
  staticData: { navigation: { menu: 'sessions', pageLabel: '세션 목록' } },
  validateSearch: sessionSearchSchema,
  search: { middlewares: [stripSearchParams({ part: 'all' })] },
  head: () => ({ meta: [{ title: '세션 관리 | YAPP+ Admin' }] }),
  component: SessionsRoute,
});

function SessionsRoute() {
  const { part } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SessionsPage
      part={part}
      onPartChange={(nextPart) => {
        void navigate({ search: { part: nextPart }, resetScroll: false });
      }}
    />
  );
}
