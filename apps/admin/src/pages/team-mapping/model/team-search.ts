/** 팀 매핑 URL에서 허용하는 filter 상태와 기본값을 정의한다. */
import { z } from 'zod';
import { teamMappingFilterSchema, type TeamMappingFilter } from '~/features/team-management';

export const teamMappingFilterLabels: Record<TeamMappingFilter, string> = {
  all: '전체 팀',
  complete: '구성 완료',
  'needs-check': '확인 필요',
  unassigned: '미배정 회원',
};

export const teamMappingSearchSchema = z.object({
  filter: teamMappingFilterSchema.default('all').catch('all'),
});

export type TeamMappingSearch = z.infer<typeof teamMappingSearchSchema>;

export const teamMappingSearchDefaults: TeamMappingSearch = {
  filter: 'all',
};
