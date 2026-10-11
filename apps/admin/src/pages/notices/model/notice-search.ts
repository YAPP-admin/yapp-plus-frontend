import { z } from 'zod';

export const noticeCategorySchema = z.enum(['all', 'session', 'submission', 'operation']);

export type NoticeCategory = z.infer<typeof noticeCategorySchema>;

export const noticeSearchSchema = z.object({
  category: noticeCategorySchema.default('all').catch('all'),
});

export const noticeCategoryLabels = {
  all: '전체',
  session: '세션',
  submission: '제출',
  operation: '운영',
} satisfies Record<NoticeCategory, string>;
