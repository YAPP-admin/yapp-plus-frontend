import { createFileRoute } from '@tanstack/react-router';
import { DiningDetailPage, diningDetailSearchSchema } from '~/pages/dining';

export const Route = createFileRoute('/_dashboard/dining/$diningId')({
  staticData: { navigation: { menu: 'dining', pageLabel: '뒤풀이 상세' } },
  validateSearch: diningDetailSearchSchema,
  head: () => ({ meta: [{ title: '뒤풀이 상세 | YAPP+ Admin' }] }),
  component: DiningDetailRoute,
});

function DiningDetailRoute() {
  const { diningId } = Route.useParams();
  const { response } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <DiningDetailPage
      diningId={diningId}
      responseFilter={response}
      onResponseFilterChange={(nextResponse) => {
        void navigate({ search: { response: nextResponse }, replace: true, resetScroll: false });
      }}
    />
  );
}
