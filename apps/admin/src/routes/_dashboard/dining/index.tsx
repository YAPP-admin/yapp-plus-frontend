import { createFileRoute } from '@tanstack/react-router';
import { DiningManagementPage, diningSearchSchema } from '~/pages/dining';

export const Route = createFileRoute('/_dashboard/dining/')({
  staticData: { navigation: { menu: 'dining', pageLabel: '뒤풀이 관리' } },
  validateSearch: diningSearchSchema,
  head: () => ({ meta: [{ title: '뒤풀이 관리 | YAPP+ Admin' }] }),
  component: DiningManagementRoute,
});

function DiningManagementRoute() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <DiningManagementPage
      period={period}
      onPeriodChange={(nextPeriod) => {
        void navigate({ search: { period: nextPeriod }, replace: true, resetScroll: false });
      }}
    />
  );
}
