import { createFileRoute } from '@tanstack/react-router';
import { DiningCreatePage } from '~/pages/dining';

export const Route = createFileRoute('/_dashboard/dining/new')({
  staticData: { navigation: { menu: 'dining', pageLabel: '뒤풀이 만들기' } },
  head: () => ({ meta: [{ title: '뒤풀이 만들기 | YAPP+ Admin' }] }),
  component: DiningCreatePage,
});
