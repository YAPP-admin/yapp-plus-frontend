import { createFileRoute } from '@tanstack/react-router';
import { DiningManagementPage } from '~/pages/dining';

export const Route = createFileRoute('/_dashboard/dining/')({
  staticData: { navigation: { menu: 'dining', pageLabel: '뒤풀이 관리' } },
  head: () => ({ meta: [{ title: '뒤풀이 관리 | YAPP+ Admin' }] }),
  component: DiningManagementPage,
});
