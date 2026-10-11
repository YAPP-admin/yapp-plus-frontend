import { createFileRoute } from '@tanstack/react-router';
import { NoticeCreatePage } from '~/pages/notice-editor';

export const Route = createFileRoute('/_dashboard/notices_/new')({
  head: () => ({ meta: [{ title: '공지 작성 | YAPP+ Admin' }] }),
  component: NoticeCreatePage,
});
