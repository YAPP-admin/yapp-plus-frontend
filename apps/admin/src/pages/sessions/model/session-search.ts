import { z } from 'zod';
import { sessionTypeSchema } from '~/features/session-management';

export const sessionFilterSchema = z.enum(['all', ...sessionTypeSchema.options]);
export type SessionFilter = z.infer<typeof sessionFilterSchema>;

export const sessionSearchSchema = z.object({
  type: sessionFilterSchema.default('all').catch('all'),
});

export const sessionFilterLabels = {
  all: '전체',
  offline: '오프라인',
  team: '팀 세션',
} satisfies Record<SessionFilter, string>;
