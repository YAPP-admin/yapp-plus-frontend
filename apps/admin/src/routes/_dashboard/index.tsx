import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '~/pages/dashboard';

export const Route = createFileRoute('/_dashboard/')({
  staticData: { navigation: { menu: 'dashboard', pageLabel: '대시보드' } },
  component: DashboardPage,
});
