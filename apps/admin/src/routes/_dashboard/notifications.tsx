import { createFileRoute } from '@tanstack/react-router';
import { NotificationsPage } from '~/pages/notifications';

export const Route = createFileRoute('/_dashboard/notifications')({
  staticData: { navigation: { menu: 'notifications', pageLabel: '알림 발송 내역' } },
  head: () => ({ meta: [{ title: '알림 발송 내역 | YAPP+ Admin' }] }),
  component: NotificationsPage,
});
