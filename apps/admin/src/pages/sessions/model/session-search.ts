/** 세션 유형 필터의 URL 검색 값과 화면 표시 이름을 정의합니다. */
import { z } from 'zod';
import { sessionTypeSchema } from './session';

export const sessionFilterSchema = z.enum(['all', ...sessionTypeSchema.options]);
export type SessionFilter = z.infer<typeof sessionFilterSchema>;

export const sessionSearchSchema = z.object({
  type: sessionFilterSchema.default('all').catch('all'),
});

export const sessionFilterLabels = {
  all: '전체',
  regular: '정규 세션',
  team: '팀 세션',
} satisfies Record<SessionFilter, string>;
