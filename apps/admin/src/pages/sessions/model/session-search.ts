import { z } from 'zod';
import { sessionTypeSchema } from '~/features/session-management';

export const sessionFilterSchema = z.enum(['all', ...sessionTypeSchema.options]);
export type SessionFilter = z.infer<typeof sessionFilterSchema>;

// 기존 북마크·외부 링크의 `type=offline`은 정규 세션으로만 읽어 호환성을 유지합니다.
export const sessionSearchSchema = z.object({
  type: z
    .preprocess((value) => (value === 'offline' ? 'regular' : value), sessionFilterSchema)
    .default('all')
    .catch('all'),
});

export const sessionFilterLabels = {
  all: '전체',
  regular: '정규 세션',
  team: '팀 세션',
} satisfies Record<SessionFilter, string>;
