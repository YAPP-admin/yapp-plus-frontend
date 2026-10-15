import { createFileRoute } from '@tanstack/react-router';
import { NoticeCreatePage } from '~/pages/notice-editor';

export const Route = createFileRoute('/_dashboard/notices/new')({
  staticData: { navigation: { menu: 'notices', pageLabel: '공지 작성' } },
  head: () => ({ meta: [{ title: '공지 작성 | YAPP+ Admin' }] }),
  component: NoticeCreatePage,
});
