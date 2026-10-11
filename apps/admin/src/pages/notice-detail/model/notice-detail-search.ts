import { z } from 'zod';

export const noticeDetailTabSchema = z.enum(['readers', 'questions']);

export type NoticeDetailTab = z.infer<typeof noticeDetailTabSchema>;

export const noticeDetailSearchSchema = z.object({
  tab: noticeDetailTabSchema.default('readers').catch('readers'),
});
