import { createFileRoute } from '@tanstack/react-router';
import { DiningDetailPage } from '~/pages/dining';

export const Route = createFileRoute('/_dashboard/dining/$diningId')({
  staticData: { navigation: { menu: 'dining', pageLabel: '뒤풀이 상세' } },
  head: () => ({ meta: [{ title: '뒤풀이 상세 | YAPP+ Admin' }] }),
  component: DiningDetailRoute,
});

function DiningDetailRoute() {
  const { diningId } = Route.useParams();

  return <DiningDetailPage diningId={diningId} />;
}
